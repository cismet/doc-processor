FROM node
RUN apt-get update -y
RUN apt-get install -y locales
RUN apt-get install -y zip
RUN apt-get install -y pdftk
RUN apt-get install convmv

ENV LOCALE de_DE
ENV ENCODING UTF-8

RUN locale-gen ${LOCALE}.${ENCODING}
ENV LANG ${LOCALE}.${ENCODING}
ENV LANGUAGE ${LOCALE}.${ENCODING}
ENV LC_ALL ${LOCALE}.${ENCODING}
ENV TZ Europe/Berlin

RUN echo "LC_ALL=${LOCALE}.${ENCODING}" >> /etc/environment
RUN echo "${LOCALE}.${ENCODING} ${ENCODING}" >> /etc/locale.gen
RUN echo "LANG=${LOCALE}.${ENCODING}" > /etc/locale.conf

RUN locale-gen --purge


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json .

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8081  





CMD [ "npm", "start" ]



