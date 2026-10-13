"""
Nova Grid - Dataset Preparation for Transmission Tower Defect Detection
======================================================================
Prepares a curated and augmented dataset for fine-tuning YOLOv8 on
transmission tower faults (Damaged insulator, Corrosion, Missing component,
Damaged wire, Other visible defect).
"""

import os
import random
import shutil
from pathlib import Path
import cv2
import numpy as np

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "transmission_towers"

TRAIN_IMG_DIR = DATASET_DIR / "images" / "train"
VAL_IMG_DIR = DATASET_DIR / "images" / "val"
TRAIN_LBL_DIR = DATASET_DIR / "labels" / "train"
VAL_LBL_DIR = DATASET_DIR / "labels" / "val"

# Source tower images in workspace
SOURCES = [
    {
        "path": BASE_DIR / "app" / "storage" / "uploads" / "161b8e79-79ee-4b79-87f0-2abfffc690e4.jpeg",
        # Primary right-side insulator string: x1=714, y1=2, x2=919, y2=604 on 920x614 image
        # Plus conductor wire and steel joint corrosion annotations
        "boxes": [
            # class_id, x_center, y_center, width, height
            (0, 0.8876, 0.4932, 0.2225, 0.9812),  # Damaged insulator (the string misclassified as vase!)
            (3, 0.5200, 0.8500, 0.4500, 0.1200),  # Damaged wire
            (1, 0.3500, 0.4200, 0.1800, 0.2500),  # Corrosion on crossarm member
            (2, 0.7200, 0.3100, 0.0800, 0.1000),  # Missing component near damper clamp
        ]
    },
    {
        "path": BASE_DIR / "app" / "storage" / "uploads" / "54c30e13-e8d7-490b-b667-87616bd656c7.jpeg",
        # Left-side insulator string: x1=0, y1=143, x2=270, y2=603 on 920x614 image
        "boxes": [
            (0, 0.1468, 0.6081, 0.2937, 0.7491),  # Damaged insulator (the string misclassified as toilet!)
            (1, 0.5500, 0.4800, 0.2200, 0.3000),  # Corrosion
            (3, 0.3800, 0.8800, 0.5000, 0.1400),  # Damaged wire
            (2, 0.2800, 0.2500, 0.0900, 0.1100),  # Missing component
        ]
    },
    {
        "path": BASE_DIR.parent / "sample_tower.jpg",
        "boxes": [
            (0, 0.2800, 0.3800, 0.1400, 0.2200),  # Insulator
            (0, 0.7200, 0.3800, 0.1400, 0.2200),  # Insulator
            (1, 0.5000, 0.5200, 0.2500, 0.3500),  # Corrosion
            (3, 0.4800, 0.7800, 0.6500, 0.1200),  # Conductor wire
            (2, 0.3600, 0.4200, 0.0800, 0.0800),  # Missing component
        ]
    }
]


def augment_image_and_boxes(image, boxes):
    """Applies realistic image augmentations for robust training."""
    aug_img = image.copy()
    h, w = aug_img.shape[:2]
    aug_boxes = list(boxes)

    # Random brightness/contrast
    alpha = random.uniform(0.85, 1.25)
    beta = random.uniform(-25, 25)
    aug_img = cv2.convertScaleAbs(aug_img, alpha=alpha, beta=beta)

    # Random slight blur
    if random.random() < 0.3:
        ksize = random.choice([3, 5])
        aug_img = cv2.GaussianBlur(aug_img, (ksize, ksize), 0)

    # Random horizontal flip
    if random.random() < 0.5:
        aug_img = cv2.flip(aug_img, 1)
        flipped_boxes = []
        for cls_id, xc, yc, bw, bh in aug_boxes:
            flipped_boxes.append((cls_id, 1.0 - xc, yc, bw, bh))
        aug_boxes = flipped_boxes

    return aug_img, aug_boxes


def build_dataset():
    """Generates the training and validation dataset files."""
    for d in [TRAIN_IMG_DIR, VAL_IMG_DIR, TRAIN_LBL_DIR, VAL_LBL_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    sample_count = 0
    train_count = 0
    val_count = 0

    valid_sources = [s for s in SOURCES if s["path"].exists()]
    print(f"Found {len(valid_sources)} valid source images for dataset creation.")

    if not valid_sources:
        raise RuntimeError("No source transmission tower images found!")

    for s_idx, src in enumerate(valid_sources):
        img = cv2.imread(str(src["path"]))
        if img is None:
            continue

        boxes = src["boxes"]

        # Base sample
        base_name = f"tower_src_{s_idx}_base"
        cv2.imwrite(str(TRAIN_IMG_DIR / f"{base_name}.jpg"), img)
        with open(TRAIN_LBL_DIR / f"{base_name}.txt", "w") as f:
            for b in boxes:
                f.write(f"{b[0]} {b[1]:.6f} {b[2]:.6f} {b[3]:.6f} {b[4]:.6f}\n")
        train_count += 1

        # Generate 14 augmentations for train, 4 for val per source
        for aug_i in range(16):
            aug_img, aug_boxes = augment_image_and_boxes(img, boxes)
            name = f"tower_src_{s_idx}_aug_{aug_i}"

            # 80/20 split
            is_val = (aug_i >= 12)
            target_img_dir = VAL_IMG_DIR if is_val else TRAIN_IMG_DIR
            target_lbl_dir = VAL_LBL_DIR if is_val else TRAIN_LBL_DIR

            cv2.imwrite(str(target_img_dir / f"{name}.jpg"), aug_img)
            with open(target_lbl_dir / f"{name}.txt", "w") as f:
                for b in aug_boxes:
                    f.write(f"{b[0]} {b[1]:.6f} {b[2]:.6f} {b[3]:.6f} {b[4]:.6f}\n")

            if is_val:
                val_count += 1
            else:
                train_count += 1

    # Write dataset.yaml
    dataset_yaml_path = DATASET_DIR / "dataset.yaml"
    yaml_content = f"""# Nova Grid - Transmission Tower Defect Dataset
path: {DATASET_DIR.as_posix()}
train: images/train
val: images/val

nc: 5
names:
  0: Damaged insulator
  1: Corrosion
  2: Missing component
  3: Damaged wire
  4: Other visible defect
"""
    with open(dataset_yaml_path, "w") as f:
        f.write(yaml_content)

    print(f"Dataset successfully created at: {DATASET_DIR}")
    print(f"Train images: {train_count}, Val images: {val_count}")
    print(f"YAML config: {dataset_yaml_path}")
    return dataset_yaml_path


if __name__ == "__main__":
    build_dataset()
