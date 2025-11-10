from fastapi import APIRouter

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.get("/")
def analyze_test():
    return {"message": "Analysis route working!"}
