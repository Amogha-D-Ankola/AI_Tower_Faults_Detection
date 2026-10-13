"""
Priority Suggestion Service
===========================
Rules-based heuristic mapping defect class and model confidence to a suggested
human review priority: "High", "Medium", or "Low".

CRITICAL RESPONSIBLE AI POLICY:
- This is strictly a triage queue suggestion for human inspectors.
- This is NOT a safety certification or structural health verdict.
- It NEVER states or implies that a transmission tower is safe or unsafe.
"""

from typing import Dict

# Base severity weights by fault category
# Electrical infrastructure integrity impacts:
# - Damaged insulators & wires carry flashover and outage risks -> High baseline
# - Missing components impact structural/mechanical integrity -> High baseline
# - Corrosion progresses over time -> Medium baseline
# - Generic or minor defects -> Low / Medium baseline
CLASS_BASE_WEIGHTS: Dict[str, str] = {
    "damaged insulator": "High",
    "insulator damage": "High",
    "broken insulator": "High",
    "damaged wire": "High",
    "wire damage": "High",
    "broken wire": "High",
    "missing component": "High",
    "missing bolt": "High",
    "corrosion": "Medium",
    "rust": "Medium",
    "structural deformation": "Medium",
    "bent member": "Medium",
    "other visible defect": "Low",
    "other defect": "Low",
    "anomaly": "Low",
}

def determine_priority(class_name: str, confidence: float) -> str:
    """
    Computes suggested review priority based on defect class and confidence score.

    Args:
        class_name: The detected fault label (case-insensitive)
        confidence: Prediction confidence score between 0.0 and 1.0

    Returns:
        One of 'High', 'Medium', or 'Low' suggested priority.
    """
    normalized_name = class_name.strip().lower()
    base_weight = CLASS_BASE_WEIGHTS.get(normalized_name, "Medium")

    # High-severity categories (critical electrical or structural impact)
    if base_weight == "High":
        if confidence >= 0.40:
            return "High"
        else:
            return "Medium"

    # Medium-severity categories (progressive degradation or non-critical anomalies)
    elif base_weight == "Medium":
        if confidence >= 0.75:
            return "High"
        elif confidence >= 0.40:
            return "Medium"
        else:
            return "Low"

    # Low-severity categories / minor or unspecified visible defects
    else:
        if confidence >= 0.80:
            return "Medium"
        else:
            return "Low"


def get_recommended_action(priority: str) -> str:
    """
    Returns a standardized, safety-conscious recommendation text.
    Strictly avoids declaring safety status.
    """
    if priority == "High":
        return "Expedited inspection by a certified transmission line engineer recommended."
    elif priority == "Medium":
        return "Schedule routine review during the next standard maintenance cycle."
    else:
        return "Log observation for secondary verification during periodic audit."
