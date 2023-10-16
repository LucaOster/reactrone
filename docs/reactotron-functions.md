---
sidebar_position: 4
title: Common Functions
---

## Reactotron Functions

Let's explore some classic functions available with Reactotron.

Add to your `App.js` (Create React Native App) or `index.js` file

```js
import Reactotron from "reactotron-react-native";
```

#### Log

```js
Reactotron.log("hello rendering world");
```

Now Reactotron looks like this:

![Hello 1](./quick-start/images/react-native/hello-1.jpg)

While collapsed, the grey arrow to the right shows a preview. Click to open.

![Hello 2](./quick-start/images/react-native/hello-2.jpg)

Now, let's change our log statement and try different methods.

```js
Reactotron.log({
  numbers: [1, 2, 3],
  boolean: false,
  nested: { here: "we go" },
});
```

#### Warn

```js
Reactotron.warn("*glares*");
```

#### Error

```js
Reactotron.error("Now you've done it.");
```

#### Display

```js
Reactotron.display({
  name: "KNOCK KNOCK",
  preview: "Who's there?",
  value: "Orange.",
});

Reactotron.display({
  name: "ORANGE",
  preview: "Who?",
  value: "Orange you glad you don't know me in real life?",
  important: true,
});
```