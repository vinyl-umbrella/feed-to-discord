async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main() {
  while (true) {
    console.log('Hello, world!');
    await sleep(10);
  }
}

main();
