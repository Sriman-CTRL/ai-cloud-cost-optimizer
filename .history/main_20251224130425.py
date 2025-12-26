from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "AI Cloud Cost Optimizer backend is running"}
