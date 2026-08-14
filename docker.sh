#!/bin/bash

# DomiExpress Docker Helper Script
# Simplifies common docker-compose operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
PROJECT_NAME="domiexpress"

# Helper functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning ".env file not found"
        echo "Copying from .env.docker..."
        cp .env.docker .env
        print_success ".env file created. Please review and update with your configuration."
    fi
}

# Show help
show_help() {
    echo "DomiExpress Docker Helper"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up                 Start all services (development mode)"
    echo "  up:prod            Start all services (production mode)"
    echo "  up:test            Start services with test databases"
    echo "  down               Stop all services"
    echo "  down:volumes       Stop services and remove volumes (CAUTION!)"
    echo "  restart            Restart all services"
    echo "  logs               Show logs from all services"
    echo "  logs:app           Show logs from app service"
    echo "  logs:db            Show logs from postgres service"
    echo "  logs:redis         Show logs from redis service"
    echo "  status             Show service status"
    echo "  shell              Open shell in app container"
    echo "  db:shell           Open psql shell in postgres container"
    echo "  redis:shell        Open redis-cli in redis container"
    echo "  migrate            Run database migrations"
    echo "  seed               Seed database with sample data"
    echo "  test               Run tests"
    echo "  test:e2e           Run e2e tests"
    echo "  build              Build Docker images"
    echo "  rebuild            Rebuild Docker images (no cache)"
    echo "  clean              Remove containers, images, and volumes"
    echo "  stats              Show resource usage"
    echo "  health             Check service health"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker.sh up"
    echo "  ./docker.sh logs:app"
    echo "  ./docker.sh migrate"
}

# Main command handling
case "${1:-help}" in
    up)
        print_header "Starting DomiExpress (Development)"
        check_env_file
        docker-compose --profile dev up -d
        print_success "Services started"
        echo ""
        echo "Access points:"
        echo "  API: http://localhost:3000"
        echo "  Health: http://localhost:3000/health"
        echo "  pgAdmin: http://localhost:5050 (admin@domiexpress.local / admin_dev_pass)"
        echo "  Redis Commander: http://localhost:8081"
        ;;

    up:prod)
        print_header "Starting DomiExpress (Production)"
        check_env_file
        docker-compose up -d
        print_success "Services started"
        ;;

    up:test)
        print_header "Starting DomiExpress (Testing)"
        check_env_file
        docker-compose --profile test up -d
        print_success "Services started with test databases"
        ;;

    down)
        print_header "Stopping DomiExpress"
        docker-compose down
        print_success "Services stopped"
        ;;

    down:volumes)
        print_warning "This will DELETE all data in volumes!"
        read -p "Are you sure? (yes/no): " -r REPLY
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_header "Stopping DomiExpress and removing volumes"
            docker-compose down -v
            print_success "Services stopped and volumes removed"
        else
            print_warning "Cancelled"
        fi
        ;;

    restart)
        print_header "Restarting DomiExpress"
        docker-compose restart
        print_success "Services restarted"
        ;;

    logs)
        print_header "Logs from all services"
        docker-compose logs -f
        ;;

    logs:app)
        print_header "Logs from app service"
        docker-compose logs -f app
        ;;

    logs:db)
        print_header "Logs from postgres service"
        docker-compose logs -f postgres
        ;;

    logs:redis)
        print_header "Logs from redis service"
        docker-compose logs -f redis
        ;;

    status)
        print_header "Service Status"
        docker-compose ps
        ;;

    shell)
        print_header "Opening shell in app container"
        docker-compose exec app sh
        ;;

    db:shell)
        print_header "Opening psql shell"
        docker-compose exec postgres psql -U domiexpress -d domiexpress_dev
        ;;

    redis:shell)
        print_header "Opening redis-cli"
        docker-compose exec redis redis-cli
        ;;

    migrate)
        print_header "Running database migrations"
        docker-compose exec app npm run db:migrate
        print_success "Migrations completed"
        ;;

    seed)
        print_header "Seeding database"
        docker-compose exec app npm run db:seed
        print_success "Database seeded"
        ;;

    test)
        print_header "Running tests"
        docker-compose exec app npm run test
        ;;

    test:e2e)
        print_header "Running e2e tests"
        docker-compose exec app npm run test:e2e
        ;;

    build)
        print_header "Building Docker images"
        docker-compose build
        print_success "Images built"
        ;;

    rebuild)
        print_header "Rebuilding Docker images (no cache)"
        docker-compose build --no-cache
        print_success "Images rebuilt"
        ;;

    clean)
        print_warning "This will remove containers, images, and volumes!"
        read -p "Are you sure? (yes/no): " -r REPLY
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_header "Cleaning up Docker resources"
            docker-compose down -v
            docker system prune -a --volumes -f
            print_success "Cleanup completed"
        else
            print_warning "Cancelled"
        fi
        ;;

    stats)
        print_header "Docker Resource Usage"
        docker stats --no-stream
        ;;

    health)
        print_header "Checking Service Health"
        echo ""
        echo -n "App (port 3000): "
        if curl -s http://localhost:3000/health > /dev/null; then
            print_success "Healthy"
        else
            print_error "Unhealthy or not responding"
        fi

        echo -n "PostgreSQL: "
        if docker-compose exec -T postgres pg_isready -U domiexpress > /dev/null 2>&1; then
            print_success "Healthy"
        else
            print_error "Unhealthy or not responding"
        fi

        echo -n "Redis: "
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            print_success "Healthy"
        else
            print_error "Unhealthy or not responding"
        fi
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
