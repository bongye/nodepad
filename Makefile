# It is not needed. express compile less

OBJS: less

all: less

less: public/stylesheets/
	cd public/stylesheets/ && make && cd -
