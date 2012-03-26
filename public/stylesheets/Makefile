.SUFFIXES: .less .css
CC = lessc
OBJS: style.css

all: $(OBJS)

.less.css:
	$(CC) $*.less > $*.css

style.css: style.less
