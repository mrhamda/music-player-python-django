# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list


# Abdullah Hamdan – Music player

This is a project I did after learning python django the project was made to showcase I know how to use python django. So this was basically about making a mini music player like spotify. You could add playlists, visit profilem follow and play music e.t.c
---

## Features

- * Being able to create and login account *

- * Being able to post, delete, edit playlists,songs*

- * Responsive design *

- * Being able to follow artists and recieve notifcations if they add a new playlist or song*

- * Playing music*

- * Playlists*

- * Favorites*

- * Randomly selects music list if the current list has ended *

- * Much more but I am in a hurry so I can't write more 😭😭*



## Tech Stack

**Frontend:**

- React
- Tailwind CSS

**Backend & Services:**

- Python django

**To start the project**

- For frontend run "npm run build"

- For backend run to enter the env first "./venv/Scripts/activate" then "python manage.py runserver"
