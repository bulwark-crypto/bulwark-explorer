
const KEY = "blockex-search-history";

const add = (term) => {
  if (!term) return;
  let searches = getSet();
  searches.add(term);

  if (searches.size > 10) {
    let s = Array.from(searches);
    s = s.reverse().slice(0, 10).reverse();
    searches = s;
  } else {
    searches = Array.from(searches);
  }

  localStorage.setItem(KEY, JSON.stringify(searches));
  return searches;
};

const del = (term) => {
  if (!term) return;
  let searches = getSet();
  searches.delete(term);

  if (searches.size > 10) {
    let s = Array.from(searches);
    s = s.reverse().slice(0, 10).reverse();
    searches = s;
  } else {
    searches = Array.from(searches);
  }

  localStorage.setItem(KEY, JSON.stringify(searches));
  return searches;
};

const get = () => {
  let searches = [];
  try {
    searches = localStorage.getItem(KEY);
    if (!searches) {
      return [];
    }
    return JSON.parse(searches);
  } catch(err) {
    return [];
  }
};

const getSet = () => {
  return new Set(get());
};

module.exports = { add, del, get, getSet };
