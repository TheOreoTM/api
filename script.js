function countWords(str) {
  const arr = str.split(' ');

  return `${arr.filter((word) => word !== '').length} Words`;
}

function fetchData() {
  fetch('https://gir-api.oreotm.repl.co/story')
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      document.getElementById('p').innerHTML = data.story;

      var header = document.getElementById('h');
      var text = document.createTextNode(countWords(data.story));
      header.appendChild(text);
    });
}
fetchData();
