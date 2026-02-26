"""
CatalyzerCardMapping entity for game integration.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class CatalyzerCardMapping:
    """
    Maps extracted assets to game's catalyzerCards.ts structure.

    Attributes:
        card_id: Catalyzer card ID (e.g., "smalltalk-ltm-01")
        packet_id: Module packet ID (e.g., "small-talk")
        role_type: "patient-robot" or "violent-robot"
        fault: Robot fault type (e.g., "long-term-memory")
        maze_asset_id: ID of ExtractedAsset for inducer maze
        maze_image_path: Path relative to public/ (e.g., "/assets/mazes/smalltalk-001.png")
        restriction_asset_ids: IDs of ExtractedAsset for restrictions (patient robots)
        restrictions_text: Extracted restriction text lines
        task_asset_ids: IDs of ExtractedAsset for tasks (violent robots)
        tasks_text: Extracted task text lines
        integration_status: "pending", "success", "failed"
        error_message: Error details if integration failed
    """

    card_id: str
    packet_id: str
    role_type: str
    fault: str
    maze_asset_id: str
    maze_image_path: str
    integration_status: str = "pending"
    restriction_asset_ids: Optional[List[str]] = None
    restrictions_text: Optional[List[str]] = None
    task_asset_ids: Optional[List[str]] = None
    tasks_text: Optional[List[str]] = None
    error_message: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate CatalyzerCardMapping after initialization."""
        if not self.card_id:
            raise ValueError("card_id cannot be empty")

        if not self.packet_id:
            raise ValueError("packet_id cannot be empty")

        if self.role_type not in ["patient-robot", "violent-robot"]:
            raise ValueError(
                f"role_type must be 'patient-robot' or 'violent-robot': {self.role_type}"
            )

        if self.integration_status not in ["pending", "success", "failed"]:
            raise ValueError(
                f"integration_status must be 'pending', 'success', or 'failed': "
                f"{self.integration_status}"
            )

        # Patient robots must have restrictions
        if self.role_type == "patient-robot":
            if not self.restrictions_text:
                raise ValueError("Patient robots must have restrictions_text")

        # Violent robots must have tasks
        if self.role_type == "violent-robot":
            if not self.tasks_text:
                raise ValueError("Violent robots must have tasks_text")

    @property
    def is_integrated(self) -> bool:
        """Check if successfully integrated into game."""
        return self.integration_status == "success"

    def to_dict(self) -> dict:
        """Serialize to dictionary for JSON output."""
        return {
            "card_id": self.card_id,
            "packet_id": self.packet_id,
            "role_type": self.role_type,
            "fault": self.fault,
            "maze_asset_id": self.maze_asset_id,
            "maze_image_path": self.maze_image_path,
            "restriction_asset_ids": self.restriction_asset_ids,
            "restrictions_text": self.restrictions_text,
            "task_asset_ids": self.task_asset_ids,
            "tasks_text": self.tasks_text,
            "integration_status": self.integration_status,
            "error_message": self.error_message,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "CatalyzerCardMapping":
        """Deserialize from dictionary (JSON input)."""
        return cls(
            card_id=data["card_id"],
            packet_id=data["packet_id"],
            role_type=data["role_type"],
            fault=data["fault"],
            maze_asset_id=data["maze_asset_id"],
            maze_image_path=data["maze_image_path"],
            restriction_asset_ids=data.get("restriction_asset_ids"),
            restrictions_text=data.get("restrictions_text"),
            task_asset_ids=data.get("task_asset_ids"),
            tasks_text=data.get("tasks_text"),
            integration_status=data.get("integration_status", "pending"),
            error_message=data.get("error_message"),
        )
