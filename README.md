# CourseRoad 3.0

Work-in-progress experiment to create new version of Courseroad, a 4-year academic planner for the MIT community.

> CourseRoad is a tool for planning out your classes over your entire time at MIT. It makes it easy to explore different majors and minors, view your progress towards their requirements, and choose which classes to take when in order to maximize your time at MIT. CourseRoad allows you to look more than one semester ahead make fully informed choices about the big picture.

## Developing

Once you've cloned the project onto your computer and installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To build this, run `pnpm run build`. This will generate a Node app that you can run with `pnpm start`.

## Deployment

Work in progress :)

## Frequently asked questions

### Why did y'all make a new version of CourseRoad?

The [previous version of CourseRoad](https://github.com/sipb/courseroad2) was initially developed in the 2018-2019 school year. It was (and as of writing, still is) developed as a frontend using Vue 2. The hope is that starting from scratch and modernizing along the way can address some long-standing issues, such as mobile friendlyness and speed, while also making it quicker and easier to use.

### What software are you using?

The frontend is build using [SolidJS](https://www.solidjs.com/), which queries the [FireRoad API](https://fireroad.mit.edu/). We're developing this version of CourseRoad using [TypeScript](https://www.typescriptlang.org/) to hopefully make development easier in the future and avoiding bugs caused by type issues.

Components are created using [Park UI](https://park-ui.com/), which uses the same underlying components as [ChakraUI](https://www.chakra-ui.com/) (which is what Hydrant uses) while being cross-platform. This is with the hope of eventually migrating to ChakraUI to create a unified design between Hydrant and CourseRoad.

### What is the development plan?

We hope to first implement everything available in the current iteration of CourseRoad to make any transition as smooth as possible, then expand on this with user feedback. If you want to help, feel free to submit a pull request!
