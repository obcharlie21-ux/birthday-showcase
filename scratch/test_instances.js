async function test() {
  const response = await fetch('https://instances.cobalt.best/api/instances');
  const data = await response.json();
  console.log(data);
}
test().catch(console.error);
