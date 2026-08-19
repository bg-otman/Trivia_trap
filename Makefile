# all: frontend backend

backend:
	@$(MAKE) -sC backend run

clean:
	@$(MAKE) -sC backend clean

fclean:
	@$(MAKE) -sC backend fclean

.PHONY: all backend clean fclean