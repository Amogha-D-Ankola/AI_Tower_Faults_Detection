"""
Nova Grid - Offline Prediction / Inference CLI
==============================================
Runs fault inference directly from terminal on an image or directory
using trained Nova Grid weights.

Usage:
    python predict.py --source sample_tower.jpg --weights ../models/best.pt --conf 0.25
"""

import sys
import argparse
from pathlib import Path

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
    print("[ERROR] Ultralytics is not installed. Run: pip install -r ../requirements.txt")
    sys.exit(1)


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Nova Grid: Run YOLOv8 defect inference on images."
    )
    parser.add_argument(
        "--source",
        type=str,
        required=True,
        help="Path to an image file or a directory containing images"
    )
    parser.add_argument(
        "--weights",
        type=str,
        default="../models/best.pt",
        help="Path to model weights (default: ../models/best.pt)"
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=0.25,
        help="Confidence threshold between 0.05 and 0.95 (default: 0.25)"
    )
    parser.add_argument(
        "--save",
        action="store_true",
        default=True,
        help="Save annotated images to output directory (default: True)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="runs/predict",
        help="Directory to save prediction visual outputs"
    )
    return parser.parse_args()


def main():
    args = parse_arguments()
    weights_path = Path(args.weights).resolve()

    if not weights_path.exists():
        print(f"[WARNING] Weights file not found at: {weights_path}")
        print("Falling back to generic yolov8n.pt base model for pipeline demonstration...")
        model_target = "yolov8n.pt"
    else:
        model_target = str(weights_path)

    source_path = Path(args.source).resolve()
    if not source_path.exists():
        print(f"[ERROR] Source file or directory not found: {source_path}")
        sys.exit(1)

    print(f"Loading model: {model_target}")
    model = YOLO(model_target)

    print(f"Running inference on: {source_path} (confidence: {args.conf})")
    results = model.predict(
        source=str(source_path),
        conf=args.conf,
        save=args.save,
        project=args.output,
        name="exp",
        exist_ok=True
    )

    print("\n" + "=" * 50)
    print(f"Inference complete on {len(results)} image(s).")
    total_detections = 0
    for idx, r in enumerate(results, start=1):
        num_boxes = len(r.boxes) if r.boxes is not None else 0
        total_detections += num_boxes
        print(f"Image {idx}: {Path(r.path).name} -> {num_boxes} detection(s)")
        if num_boxes > 0:
            for b in r.boxes:
                cls_id = int(b.cls[0].item())
                conf = float(b.conf[0].item())
                name = r.names.get(cls_id, f"Class_{cls_id}")
                coords = [round(x, 1) for x in b.xyxy[0].tolist()]
                print(f"   * {name} ({conf * 100:.1f}%) at {coords}")

    print("=" * 50)
    print(f"Total detections: {total_detections}")
    print(f"Annotated outputs saved in: {args.output}")


if __name__ == "__main__":
    main()
