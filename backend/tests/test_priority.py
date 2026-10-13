"""
Tests for Priority Suggestion Service
"""

import pytest
from app.services.priority import determine_priority, get_recommended_action


def test_high_priority_classes():
    # Damaged insulator has high severity baseline
    assert determine_priority("Damaged insulator", 0.85) == "High"
    assert determine_priority("Damaged insulator", 0.45) == "High"
    assert determine_priority("Damaged insulator", 0.25) == "Medium"


def test_medium_priority_classes():
    # Corrosion has medium severity baseline
    assert determine_priority("Corrosion", 0.90) == "High"
    assert determine_priority("Corrosion", 0.50) == "Medium"
    assert determine_priority("Corrosion", 0.20) == "Low"


def test_low_priority_classes():
    # Other visible defect has low severity baseline
    assert determine_priority("Other visible defect", 0.85) == "Medium"
    assert determine_priority("Other visible defect", 0.40) == "Low"


def test_unknown_class_fallback():
    # Unknown classes default to medium severity logic
    assert determine_priority("Unidentified Anomaly", 0.80) == "High"
    assert determine_priority("Unidentified Anomaly", 0.50) == "Medium"


def test_recommended_actions():
    high_rec = get_recommended_action("High")
    med_rec = get_recommended_action("Medium")
    low_rec = get_recommended_action("Low")

    assert "expedited" in high_rec.lower() or "certified" in high_rec.lower()
    assert "routine" in med_rec.lower()
    assert "observation" in low_rec.lower()
