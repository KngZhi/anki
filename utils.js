const is = {
  arr: (parm) => Array.isArray(parm),
}

const subArr = (par, child) => {
  if(!is.arr(par) && par.length) return;
  return par.every(parentItem =>
    child.includes(parentItem))
}

