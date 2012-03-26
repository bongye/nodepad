OBJS: less

all: less

less: public/stylesheets/
	cd public/stylesheets/ && make && cd -
