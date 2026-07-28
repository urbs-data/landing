---
id: "shortening-distance-users-information"
slug: "acortar-la-distancia-self-service"
title: "Acortar la distancia: por qué lo intangible necesita salir antes de la cocina"
description: "Cómo tangibilizar proyectos de datos intangibles como un Lakehouse, y por qué la IA está por fin habilitando la promesa del self-service que veníamos escuchando desde 2017."
date: "2026-07-27"
author: "Martina Di Carlo, Data Lead de Urbs Data"
readTime: "3 min"
tags:
  - Data
  - Self-Service
  - IA
  - Producto
---

Todo el tiempo estamos negociando entre tres fuerzas que tironean para lados distintos: la urgencia, la consistencia en los datos y la disponibilidad de los mismos. Rara vez podemos maximizar las tres a la vez. Y en esa tensión aprendimos algo que hoy nos parece obvio, pero que nos costó bastante entender. Es importante que las preguntas de negocio que surgen en momentos críticos sean respondidas rápido y de manera consistente. Y es más importante aún que esa respuesta sea la correcta. 

Desde Urbs Data trabajamos para que esto sea posible. Pero muchas veces tambien sucede, que nuestro trabajo se queda en las sombras. Cuando hablamos de un producto de Data, nuestro entregable suele ser un Lakehouse o un Data Warehouse. Y a los equipos de negocio, de qué les sirve si no saben SQL, no conocen las tablas, no saben que campos hay? Traducimos esto en nuestra frase de cabecera **"acortar la distancia entre los usuarios y la información"**. 

## ¿Cómo medís el impacto en tus clientes cuando tu producto es, muchas veces, intangible?

Nos pasó varias veces: reunión de actualización sobre el desarrollo de un Lakehouse, meses de arquitectura, pipelines, modelado, decisiones técnicas cuidadosamente pensadas... y el cliente nos mira y nos dice: "Okay, ¿pero dónde está? ¿Qué puedo hacer con esto?" Hasta que no responde preguntas de negocio concretas, el negocio no ve el valor agregado.

Ahí entendimos algo clave: nuestro trabajo tiene que salir de la cocina mucho antes. No necesariamente para ser entregado totalmente —el Lakehouse sigue necesitando su tiempo de maduración—, pero sí para mostrarse, para tangibilizar una idea. Un cliente no compra una arquitectura, compra la certeza de que esa arquitectura le va a resolver algo. Y esa certeza se construye mostrando, no describiendo.

## El self-service, esa promesa de siempre

Vengo escuchando la premisa del "self-service" desde mi primer trabajo, allá por 2017. La idea siempre fue la misma: que los usuarios puedan acceder mejor y más rápido a los datos, sin intermediarios. Tampoco queremos que dependan de nosotros, que somos para ellos, una consultora externa. Si bien podría parecer tentador, generar esa dependencia no es lo que queremos. De hecho, lo que nosotros necesitamos para tener éxito en nuestros proyectos es que los usuarios sean autónomos y competentes en el uso de la información.

Hace 4 años venimos pensando en como poder acortar esa distancia. Y el aumento de capacidades en los LLMs, y la baja en el costo de la infraestructura nos están dando herramientas que nos permiten iterar mucho más rápido. A partir de ideas sueltas que venimos trabajando desde nuestra vertical de IA, que fuimos probando y validando, ensamblamos nuestro proyecto Metis que viene a resolver verdaderamente la vieja promesa del self-service. 

## La antesala

De esa combinación —la necesidad de tangibilizar rápido y los aceleradores que la IA nos habilita— nació proyecto Metis: una tool que se inserta entre tu Lakehouse y tu herramienta de BI, una herramienta que te permite hacer consultas a tu Data Warehouse, y que te permite visualizar los resultados en tu Metabase. Todo esto conversando en lenguaje natural.

Y acá surge algo importante, que creo que es un germen que viene de mi experiencia trabajando en equipos de negocio. La consistencia de negocio de los datos, no se puede ahorrar. El trabajo de nuestros Data Analysts no se puede sustituir por un LLM. Ya que no es solo relevar como funciona el negocio para poder definir los KPIs y generar texto a lo bobo, sino que es colaborar para descubrir y nomenclar situaciones que jamas fueron documentadas ni definidas formalmente. Muchas veces las empresas funcionan muy bien, sin necesidad de tener documentados y delineados los procesos diarios. Tal vez cuando llega el momento de automatizarlos, surge la necesidad del entendimiento profundo y esto, muchas veces, lo seguimos haciendo mejor los humanos. 

Es por eso que nuestro proyecto Metis se acopla entre el Lakehouse con sus definiciones de negocio ya resueltas, y la herramienta de BI, con sus queries y sus visualizaciones. El desarrollo del Lakehouse, lo siguien haciendo nuestros Data Analysts con las herramientas que hoy en día permiten agilizar este proceso. Ahí mismo persiste el modelo semántico de negocio. Al usar dbt, podemos documentar la definición de las tablas y columnas, y las definiciones tomadas con el negocio. Esto, además, es público y accesible para todos los usuarios, no solo para los que trabajan en el equipo de Data. Lo dejamos disponible en Metabase y tambien en Metis para que pueda ser consultado por cualquiera. 

## El modelo semántico de negocio

El modelo semántico de negocio es el conjunto de definiciones, reglas y relaciones que describen la estructura y el significado de los datos en una organización. Es la base sobre la que se construyen las decisiones y las acciones de los usuarios. Por ejemplo, en el modelo semántico podemos definir qué es la contribución marginal de un producto, o el margen bruto de un negocio, o a qué consideramos un cliente fiel. Estas cuestiones no son triviales y tienen que ser públicas y accesibles para todos los usuarios.

## Proyecto Metis
Con el modelo semántico, los usuarios pasan a poder construir soluciones. El problema es que no todos los usuarios saben usar SQL o herramientas de BI. Y ahí aparece Metis, una plataforma que permite construir soluciones one-shot, o tableros que necesiten quedar vivos para siempre, responder preguntas rapidas de negocio, todo desde un chat tradicional. Sin necesidad de entrar a diferentes plataformas, todo desde un solo lugar.

No es magia: es sacar el trabajo de la cocina antes, ponerlo en manos de quien lo necesita, y dejar que la distancia entre el usuario y su información sea, por fin, la que siempre quisimos que fuera. 

