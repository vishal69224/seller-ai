from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    gstin: str | None = None
    address: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    company: str | None = None
    gstin: str | None = None
    address: str | None = None


ProductStatus = Literal["active", "draft", "out_of_stock", "archived"]


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = ""
    sku: str = Field(min_length=1, max_length=80)
    category: str = "Electronics"
    brand: str | None = None
    price: float = Field(ge=0)
    discount: float = Field(default=0, ge=0, le=100)
    stock: int = Field(default=0, ge=0)
    marketplace: str = "Amazon"
    marketplaces: list[str] = Field(default_factory=list)
    status: ProductStatus = "draft"
    images: list[str] = Field(default_factory=list)
    weight: float | None = Field(default=None, ge=0)
    length: float | None = Field(default=None, ge=0)
    width: float | None = Field(default=None, ge=0)
    height: float | None = Field(default=None, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sku: str | None = None
    category: str | None = None
    brand: str | None = None
    price: float | None = Field(default=None, ge=0)
    discount: float | None = Field(default=None, ge=0, le=100)
    stock: int | None = Field(default=None, ge=0)
    marketplace: str | None = None
    marketplaces: list[str] | None = None
    status: ProductStatus | None = None
    images: list[str] | None = None
    weight: float | None = Field(default=None, ge=0)
    length: float | None = Field(default=None, ge=0)
    width: float | None = Field(default=None, ge=0)
    height: float | None = Field(default=None, ge=0)


class ProductOut(ProductBase):
    id: str
    image_color: str
    image_initials: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


ConnectionStatus = Literal["connected", "disconnected", "pending"]


class MarketplaceCredentials(BaseModel):
    client_id: str = ""
    client_secret: str = ""
    merchant_id: str = ""
    seller_id: str = ""


class MarketplaceConnectionUpsert(BaseModel):
    marketplace_id: str
    credentials: MarketplaceCredentials
    status: ConnectionStatus = "connected"


class MarketplaceConnectionOut(BaseModel):
    id: str
    marketplace_id: str
    name: str
    description: str
    status: ConnectionStatus
    initials: str
    brand_color: str
    logo_bg: str
    credentials: MarketplaceCredentials
    created_at: datetime | None = None
    updated_at: datetime | None = None


class TestConnectionRequest(BaseModel):
    marketplace_id: str
    credentials: MarketplaceCredentials


class TestConnectionResponse(BaseModel):
    success: bool
    message: str
