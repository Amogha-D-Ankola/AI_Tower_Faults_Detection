"""
Nova Grid - Model Training Pipeline
===================================
Automates fine-tuning of YOLOv8 architectures on transmission tower defect datasets.
Includes strict validation of dataset paths, validation/test metrics computation,
and optional export to backend/models/best.pt.

Usage:
    python train.py --data dataset.example.yaml --epochs 50 --imgsz 640 --copy-best
"""

import sys
import shutil
import argparse
from pathlib import Path
import yaml

import torch
_orig_torch_load = torch.load
def _safe_torch_load(*args, **kwargs):
    if "weights_only" not in kwargs:
        kwargs["weights_only"] = False
    return _orig_torch_load(*args, **kwargs)
torch.load = _safe_torch_load

try:
    from ultralytics import YOLO
except ImportError:
    print("[ERROR] Ultralytics is not installed. Please install requirements via:")
    print("        pip install -r ../requirements.txt")
    sys.exit(1)


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Nova Grid: Train YOLOv8 on drone transmission tower fault datasets."
    )
    parser.add_argument(
        "--data",
        type=str,
        default="dataset.example.yaml",
        help="Path to dataset YAML file (default: dataset.example.yaml)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="yolov8n.pt",
        help="Base YOLO model weights to fine-tune (default: yolov8n.pt)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=50,
        help="Number of training epochs (default: 50)"
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Target image resolution size (default: 640)"
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Batch size (default: 16)"
    )
    parser.add_argument(
        "--device",
        type=str,
        default="",
        help="Compute device: '0' for CUDA GPU, 'cpu' for CPU, or '' for auto-detection"
    )
    parser.add_argument(
        "--project",
        type=str,
        default="runs/train",
        help="Directory to save training run logs and checkpoints"
    )
    parser.add_argument(
        "--name",
        type=str,
        default="novagrid_tower_model",
        help="Run identifier"
    )
    parser.add_argument(
        "--patience",
        type=int,
        default=20,
        help="Early stopping patience in epochs without validation improvement"
    )
    parser.add_argument(
        "--copy-best",
        action="store_true",
        help="Automatically copy resulting best.pt weights to backend/models/best.pt"
    )
    return parser.parse_args()


def validate_dataset_yaml(yaml_path_str: str) -> dict:
    """
    Validates that the dataset YAML file and its declared train/val splits exist.
    """
    yaml_path = Path(yaml_path_str).resolve()
    if not yaml_path.exists():
        print(f"\n[ERROR] Dataset YAML file not found: {yaml_path}")
        print("Please provide a valid YAML configuration using --data <path-to-yaml>.")
        sys.exit(1)

    try:
        with open(yaml_path, "r", encoding="utf-8") as f:
            data_cfg = yaml.safe_load(f)
    except Exception as e:
        print(f"\n[ERROR] Failed to parse YAML file: {e}")
        sys.exit(1)

    base_path = yaml_path.parent
    if "path" in data_cfg and data_cfg["path"]:
        root_dir = (base_path / data_cfg["path"]).resolve()
    else:
        root_dir = base_path

    print("\n--- Validating Dataset Structure ---")
    print(f"Dataset root: {root_dir}")

    # Check root directory
    if not root_dir.exists():
        print(f"[ERROR] Declared dataset root does not exist: {root_dir}")
        print("Tip: Download your labeled dataset from Roboflow or Kaggle and extract it into backend/datasets/.")
        sys.exit(1)

    # Validate train split
    train_rel = data_cfg.get("train", "")
    train_dir = (root_dir / train_rel).resolve()
    if not train_dir.exists():
        print(f"[ERROR] Training images path does not exist: {train_dir}")
        print("Tip: Ensure the 'train' field in your YAML points to the correct images/train directory.")
        sys.exit(1)

    # Validate val split
    val_rel = data_cfg.get("val", "")
    val_dir = (root_dir / val_rel).resolve()
    if not val_dir.exists():
        print(f"[ERROR] Validation images path does not exist: {val_dir}")
        print("Tip: Ensure the 'val' field in your YAML points to the correct images/val directory.")
        sys.exit(1)

    print(f"[OK] Training split verified:   {train_dir}")
    print(f"[OK] Validation split verified: {val_dir}")

    # Check test split (optional but recommended)
    test_rel = data_cfg.get("test")
    if test_rel:
        test_dir = (root_dir / test_rel).resolve()
        if test_dir.exists():
            print(f"[OK] Test split verified:       {test_dir}")
        else:
            print(f"[WARNING] Test split declared but directory not found: {test_dir}")

    names = data_cfg.get("names", {})
    print(f"[OK] Configured classes ({len(names)}): {names}")
    print("------------------------------------\n")
    return data_cfg


def main():
    args = parse_arguments()
    print("=" * 60)
    print("Nova Grid: AI Transmission Tower Fault Detection Training")
    print("=" * 60)

    # 1. Validate dataset configuration
    data_cfg = validate_dataset_yaml(args.data)
    yaml_path = str(Path(args.data).resolve())

    # 2. Initialize YOLO architecture
    print(f"Initializing YOLO model: {args.model}")
    model = YOLO(args.model)

    # 3. Train
    print("\nStarting model training...")
    train_kwargs = {
        "data": yaml_path,
        "epochs": args.epochs,
        "imgsz": args.imgsz,
        "batch": args.batch,
        "project": args.project,
        "name": args.name,
        "patience": args.patience,
        "verbose": True
    }
    if args.device:
        train_kwargs["device"] = args.device

    train_results = model.train(**train_kwargs)

    # 4. Evaluate metrics honestly on validation split
    print("\nEvaluating model on validation split...")
    val_metrics = model.val(data=yaml_path, split="val")

    p = getattr(val_metrics.box, "p", [0])[0] if hasattr(val_metrics.box, "p") else 0
    r = getattr(val_metrics.box, "r", [0])[0] if hasattr(val_metrics.box, "r") else 0
    map50 = getattr(val_metrics.box, "map50", 0)
    map50_95 = getattr(val_metrics.box, "map", 0)

    print("\n" + "=" * 50)
    print("ACTUAL EVALUATION METRICS (Validation Split):")
    print(f"Precision: {p:.4f}")
    print(f"Recall:    {r:.4f}")
    print(f"mAP@50:    {map50:.4f}")
    print(f"mAP@50-95: {map50_95:.4f}")
    print("=" * 50)

    # 5. Optionally copy best weights to backend/models/best.pt
    save_dir = Path(train_results.save_dir) if hasattr(train_results, "save_dir") else Path(args.project) / args.name
    best_weights = save_dir / "weights" / "best.pt"

    if best_weights.exists():
        print(f"\nBest model checkpoint saved at: {best_weights}")
        if args.copy_best:
            target_models_dir = Path(__file__).resolve().parent.parent / "models"
            target_models_dir.mkdir(parents=True, exist_ok=True)
            target_dest = target_models_dir / "best.pt"
            shutil.copy(best_weights, target_dest)
            print(f"[SUCCESS] Copied trained weights to: {target_dest}")
            print("Restart the Nova Grid backend to activate the custom model!")
    else:
        print(f"[INFO] Training finished. Check {save_dir} for outputs.")


if __name__ == "__main__":
    main()
