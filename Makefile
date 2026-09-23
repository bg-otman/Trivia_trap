# all: frontend backend

backend:
	@$(MAKE) -sC backend run

clean:
	@$(MAKE) -sC backend clean

frontend:
	@$(MAKE) -sC frontend run

fclean:
	@$(MAKE) -sC backend fclean

.PHONY: all backend clean frontend fclean