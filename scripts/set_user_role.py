import os
import sys

import firebase_admin
from firebase_admin import auth

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "tarl-agents")

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        options={
            "projectId": FIREBASE_PROJECT_ID,
        }
    )


def set_user_role(uid: str, role: str):
    valid_roles = ["student", "teacher", "admin"]

    if role not in valid_roles:
        raise ValueError(
            f"Invalid role '{role}'. Choose from: {valid_roles}"
        )

    auth.set_custom_user_claims(uid, {"role": role})

    print(f"Successfully assigned '{role}' role to user UID: {uid}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python -m scripts.set_user_role <USER_UID> <ROLE>")
        sys.exit(1)

    target_uid = sys.argv[1]
    target_role = sys.argv[2]

    set_user_role(target_uid, target_role)
