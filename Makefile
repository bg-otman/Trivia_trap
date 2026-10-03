# all: frontend backend

backend:
	@$(MAKE) -sC backend run

google:
	@python3 -m http.server 3000 --bind 127.0.0.1 --directory backend/app/authentication/docs

clean:
	@$(MAKE) -sC backend clean

frontend:
	@$(MAKE) -sC frontend run

fclean:
	@$(MAKE) -sC backend fclean

.PHONY: all backend google clean frontend fclean
