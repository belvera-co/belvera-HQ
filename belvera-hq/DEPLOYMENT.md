# Deployment

## Local (dev)
docker-compose up -d
Frontend: http://localhost:3000
Backend: http://localhost:8000/docs

## Production Checklist
1. Set .env: SECRET_KEY, DATABASE_URL, POSTGRES_PASSWORD
2. Change default logins in users table
3. Backup DB: docker-compose exec db pg_dump -U belvera belvera_hq > backup.sql
4. Deploy to Railway/Render: use Dockerfile.backend + Dockerfile.frontend
5. Enable HTTPS + CORS for frontend URL

## Verify Backend Logging
docker-compose exec db psql -U belvera -d belvera_hq -c "SELECT * FROM products;"
docker-compose exec db psql -U belvera -d belvera_hq -c "SELECT * FROM orders LIMIT 5;"