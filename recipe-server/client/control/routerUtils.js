// Given a route (e.g. `/hello/:id/there`), finds params that need to be
// populated (e.g. `:id`) and returns a string with populated values.
export const replaceUrlVariables = (url, params) => {
  let newUrl = url;
  const urlParams = url.match(/:[a-z]+/gi);

  if (urlParams) {
    urlParams.forEach(piece => {
      newUrl = newUrl.replace(piece, params[piece.slice(1)] || piece);
    });
  }

  return newUrl;
};

export const lilRouterize = tree => {
  const pathFinder = /\/([:a-zA-Z0-9_]+)?/ig;
  const built = {};
  let curr = built;

  for (const path in tree) {
    const pieces = path.match(pathFinder) || [];

    pieces.forEach((piece, idx) => {
      curr[piece] = {
        ...curr[piece],
      };

      // If we're at the end of pieces, store the Route information.
      if (idx === pieces.length - 1) {
        curr[piece] = {
          ...tree[path],
        };
      }

      // Dive deeper into the current branch.
      curr = curr[piece];
    });

    // Routes such as `/recipe` and `/extension` need to nest under the root '/'
    curr = built['/'];
  }

  return built;
};

/**
 * @class {Route}
 * @property {String}    slug         Internal route name
 * @property {Component} component    React component used to render route
 *
 * @property {String}    crumb        Displayed text on navigational breadcrumbs
 * @property {String}    sessionSlug  Optional replacement slug used with session history.
 * @property {Route}     '/[...]'     Optional nested route tree(s).
 */
export class Route {
  static unslugify(val) {
    return val
      .split('-')
      .map(str => str.slice(0, 1).toUpperCase() + str.slice(1, str.length))
      .join(' ');
  }

  constructor(slug, component, extras) {
    this.slug = slug;
    this.component = component;

    // For optional/custom properties such as `crumb` or `sessionSlug`.
    for (const prop in extras) {
      this[prop] = extras[prop];
    }

    if (!this.crumb) {
      this.crumb = Route.unslugify(this.slug);
    }
  }
}
