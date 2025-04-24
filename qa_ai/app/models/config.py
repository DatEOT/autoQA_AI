from pydantic import BaseModel
from typing import Optional


class Config(BaseModel):
    idConfig: int
    websiteName: str
    websiteDescription: Optional[str] = None
    websiteKeywords: Optional[str] = None
    logo: Optional[bytes] = None
    phoneNumber1: Optional[str] = None
    phoneNumber2: Optional[str] = None
    address: Optional[str] = None
    tiktok: Optional[str] = None
    facebook: Optional[str] = None
    zalo: Optional[str] = None

    class Config:
        from_attributes = True


class WebsiteUpdate(BaseModel):
    websiteName: Optional[str] = None
    websiteDescription: Optional[str] = None
    websiteKeywords: Optional[str] = None
    logo: Optional[str] = None


class ContactUpdate(BaseModel):
    phoneNumber1: Optional[str] = None
    phoneNumber2: Optional[str] = None
    address: Optional[str] = None


class SocialMediaUpdate(BaseModel):
    tiktok: Optional[str] = None
    facebook: Optional[str] = None
    zalo: Optional[str] = None
