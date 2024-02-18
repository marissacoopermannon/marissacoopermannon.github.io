function random(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

document.querySelector("img").src = `under${random([1, 2, 3, 4, 5])}.gif`;
