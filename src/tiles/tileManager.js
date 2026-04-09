export default async function loadTile(file, countX, countY, container, state) {
    const response = await fetch(`../tiles/${file}`);

    const listTile = {
        image: await createImageBitmap(await response.blob()),
        listItem: [],
    };

    const stepX = listTile.image.width / countX;
    const stepY = listTile.image.height / countY;

    container.querySelectorAll("canvas").forEach((canvas, index) => {
        canvas.style.width = (listTile.image.width * countX) + "px";
        canvas.style.height = (listTile.image.height * countY) + "px";
    });

    for (let y = 0; y < countY; y++) {
        for (let x = 0; x < countX; x++) {
            listTile.listItem.push(await createImageBitmap(listTile.image, stepX * x, stepY * y, stepX, stepY));
        }
    }

    state.background = Array.from({ length: countY }, () =>
        Array(countX).fill(null)
    )

    return listTile;
}
