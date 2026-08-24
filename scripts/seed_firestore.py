import os
import sys
from google.cloud import firestore

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

db = firestore.Client(project="vertical-theory-383513")

demo_students = [
    {"id": "s1", "name": "Amina", "age": 4, "literacy_level": "Beginner", "numeracy_level": "Single Digit"},
    {"id": "s2", "name": "Samuel", "age": 10, "literacy_level": "Beginner", "numeracy_level": "Single Digit"},
    {"id": "s3", "name": "Kofi", "age": 9, "literacy_level": "Word", "numeracy_level": "Addition"},
    {"id": "s4", "name": "Zainab", "age": 8, "literacy_level": "Story", "numeracy_level": "Division"}
]

print(" Seeding Firestore database...")
for s in demo_students:
    db.collection("students").document(s["id"]).set(s)
    print(f" Saved student: {s['name']} (ID: {s['id']})")

print(" Firestore seeding complete!\n")
