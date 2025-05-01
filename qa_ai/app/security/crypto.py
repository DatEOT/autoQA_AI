# app/utils/crypto.py
import os
from cryptography.fernet import Fernet

# Lấy master-key (32-byte base64) từ biến môi trường
FERNET_MASTER_KEY = os.getenv("FERNET_MASTER_KEY")
if not FERNET_MASTER_KEY:
    raise RuntimeError("Missing FERNET_MASTER_KEY environment variable")

fernet = Fernet(FERNET_MASTER_KEY)


def encrypt_secret(secret: str) -> bytes:
    """Trả về ciphertext (bytes) để lưu VARBINARY."""
    return fernet.encrypt(secret.encode())


def decrypt_secret(ciphertext: bytes) -> str:
    return fernet.decrypt(ciphertext).decode()
