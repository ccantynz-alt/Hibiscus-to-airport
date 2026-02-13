import sys
import os
sys.path.append('backend')
from auth import get_password_hash, verify_password

def test():
    password = "Kongkon2025"
    hashed = get_password_hash(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed}")

    # Test correct password
    assert verify_password(password, hashed) == True
    print("Verification with correct password: OK")

    # Test incorrect password
    assert verify_password("wrong", hashed) == False
    print("Verification with incorrect password: OK")

if __name__ == "__main__":
    test()
