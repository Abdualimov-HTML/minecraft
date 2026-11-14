
import * as THREE from 'three';

// ============================================
// 1. ОСНОВА ИГРЫ
// ============================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 45, 115);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

const renderer = new THREE.WebGLRenderer({
    antialias: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('game').prepend(renderer.domElement);

// Свет
const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(30, 60, 20);
scene.add(sun);

scene.add(
    new THREE.HemisphereLight(0xc7eaff, 0x55442b, 1.1)
);

// ============================================
// 2. ПИКСЕЛЬНЫЕ ТЕКСТУРЫ 16x16
// ============================================

function makeTexture(draw) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    draw(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

function noise(ctx, base, colors, count = 100) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 16, 16);

    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 16);
        const y = Math.floor(Math.random() * 16);

        ctx.fillStyle = colors[
            Math.floor(Math.random() * colors.length)
        ];

        ctx.fillRect(x, y, 1, 1);
    }
}

// Трава
const grassTop = makeTexture(ctx => {
    noise(ctx, '#55a630',
        ['#478d27', '#68b63b', '#75bd45', '#397e24'],
        120
    );
});

const grassSide = makeTexture(ctx => {
    noise(ctx, '#79502e',
        ['#603b22', '#93613a', '#a16a3b'],
        85
    );

    ctx.fillStyle = '#58a832';
    ctx.fillRect(0, 0, 16, 4);

    for (let i = 0; i < 25; i++) {
        ctx.fillStyle = '#397e24';
        ctx.fillRect(
            Math.floor(Math.random() * 16),
            Math.floor(Math.random() * 4),
            1, 1
        );
    }
});

// Земля
const dirtTex = makeTexture(ctx => {
    noise(ctx, '#79502e',
        ['#603b22', '#93613a', '#704524', '#a06a3c'],
        125
    );
});

// Камень
const stoneTex = makeTexture(ctx => {
    noise(ctx, '#858585',
        ['#707070', '#999999', '#646464', '#ababab'],
        110
    );
});

// Булыжник
const cobbleTex = makeTexture(ctx => {
    noise(ctx, '#777777',
        ['#555555', '#999999', '#666666'],
        90
    );

    ctx.strokeStyle = '#444444';

    for (let y = 0; y < 16; y += 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(16, y);
        ctx.stroke();
    }
});

// Песок
const sandTex = makeTexture(ctx => {
    noise(ctx, '#d9c27a',
        ['#cbb46d', '#eee0a0', '#bda765', '#f0d991'],
        125
    );
});

// Дерево
const woodSide = makeTexture(ctx => {
    noise(ctx, '#80502b',
        ['#613a20', '#a36a37', '#704321'],
        80
    );

    ctx.fillStyle = '#633b21';
    ctx.fillRect(3, 0, 1, 16);
    ctx.fillRect(11, 0, 1, 16);
});

// Срез дерева
const woodTop = makeTexture(ctx => {
    ctx.fillStyle = '#b58a53';
    ctx.fillRect(0, 0, 16, 16);

    ctx.strokeStyle = '#76502e';
    ctx.strokeRect(2, 2, 12, 12);
    ctx.strokeRect(5, 5, 6, 6);

    ctx.fillStyle = '#76502e';
    ctx.fillRect(7, 7, 2, 2);
});

// Листва
const leavesTex = makeTexture(ctx => {
    noise(ctx, '#367d27',
        ['#245b20', '#4b9c32', '#64aa3c', '#2c7025'],
        170
    );
});

// Доски
const plankTex = makeTexture(ctx => {
    noise(ctx, '#a27643',
        ['#8a5d32', '#bd9259', '#d0a66b'],
        55
    );

    ctx.fillStyle = '#65472b';
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 11, 16, 1);
});

// Кирпич
const brickTex = makeTexture(ctx => {
    ctx.fillStyle = '#9a4c3a';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#d1b6a1';

    for (let y = 0; y < 16; y += 5) {
        ctx.fillRect(0, y, 16, 1);
    }

    ctx.fillRect(4, 0, 1, 5);
    ctx.fillRect(11, 5, 1, 5);
    ctx.fillRect(4, 10, 1, 6);
});

// Стекло
const glassTex = makeTexture(ctx => {
    ctx.fillStyle = '#9edfff';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#e5f8ff';
    ctx.fillRect(2, 2, 2, 12);
    ctx.fillRect(2, 2, 12, 2);

    ctx.fillStyle = '#65b6dc';
    ctx.fillRect(12, 4, 2, 10);
});

// Кровать
const bedTex = makeTexture(ctx => {
    noise(ctx, '#b82c36',
        ['#d84c52', '#a51d2a', '#e76b6b'],
        80
    );
});

// ============================================
// 3. МАТЕРИАЛЫ
// ============================================

function mat(texture, options = {}) {
    return new THREE.MeshLambertMaterial({
        map: texture,
        ...options
    });
}

const grassMaterial = [
    mat(grassSide),
    mat(grassSide),
    mat(grassTop),
    mat(dirtTex),
    mat(grassSide),
    mat(grassSide)
];

const woodMaterial = [
    mat(woodSide),
    mat(woodSide),
    mat(woodTop),
    mat(woodTop),
    mat(woodSide),
    mat(woodSide)
];

const blockMaterials = {
    grass: grassMaterial,
    dirt: mat(dirtTex),
    stone: mat(stoneTex),
    cobble: mat(cobbleTex),
    wood: woodMaterial,
    planks: mat(plankTex),
    leaves: mat(leavesTex),
    sand: mat(sandTex),
    brick: mat(brickTex),
    glass: mat(glassTex, {
        transparent: true,
        opacity: 0.55,
        depthWrite: false
    }),
    bed: mat(bedTex)
};

const geometry = new THREE.BoxGeometry(1, 1, 1);

// ============================================
// 4. СИСТЕМА БЛОКОВ И ПАМЯТИ
// ============================================

const capacities = {
    grass: 10000,
    dirt: 25000,
    stone: 100000,
    cobble: 12000,
    wood: 12000,
    planks: 12000,
    leaves: 25000,
    sand: 6000,
    brick: 12000,
    glass: 6000,
    bed: 2000
};

const blocks = new Map();
const instances = {};
const blockKeys = {};

const dummy = new THREE.Object3D();

for (const type of Object.keys(blockMaterials)) {
    const mesh = new THREE.InstancedMesh(
        geometry,
        blockMaterials[type],
        capacities[type]
    );

    mesh.count = 0;
    mesh.frustumCulled = false;
    mesh.userData.type = type;

    scene.add(mesh);

    instances[type] = mesh;
    blockKeys[type] = [];
}

function blockKey(x, y, z) {
    return `${x},${y},${z}`;
}

function addBlock(x, y, z, type) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    if (!instances[type]) return false;

    const key = blockKey(x, y, z);

    if (blocks.has(key)) return false;

    const mesh = instances[type];
    const index = mesh.count;

    if (index >= capacities[type]) {
        console.warn('Достигнут лимит блоков:', type);
        return false;
    }

    dummy.position.set(x, y, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();

    mesh.setMatrixAt(index, dummy.matrix);
    mesh.count++;

    blockKeys[type][index] = key;

    blocks.set(key, {
        type,
        index
    });

    mesh.instanceMatrix.needsUpdate = true;

    return true;
}

function removeBlock(mesh, instanceId) {
    const type = mesh.userData.type;
    const key = blockKeys[type][instanceId];

    if (!key || type === 'bed') return;

    const last = mesh.count - 1;

    if (instanceId !== last) {
        mesh.getMatrixAt(last, dummy.matrix);
        mesh.setMatrixAt(instanceId, dummy.matrix);

        const movedKey = blockKeys[type][last];

        blockKeys[type][instanceId] = movedKey;
        blocks.get(movedKey).index = instanceId;
    }

    blockKeys[type].pop();
    mesh.count--;

    blocks.delete(key);

    mesh.instanceMatrix.needsUpdate = true;
}

// ============================================
// 5. ГЕНЕРАЦИЯ БОЛЬШОГО МИРА
// ============================================

const WORLD_RADIUS = 32;
const MIN_Y = -18;

function heightAt(x, z) {
    return Math.floor(
        3 +
        Math.sin(x * 0.11) * 2.5 +
        Math.cos(z * 0.13) * 2 +
        Math.sin((x + z) * 0.07) * 2
    );
}

function caveNoise(x, y, z) {
    return (
        Math.sin(x * 0.29 + y * 0.37 + z * 0.21) +
        Math.cos(x * 0.17 - y * 0.23 + z * 0.31) +
        Math.sin(x * 0.11 + z * 0.16 - y * 0.41)
    );
}

function generateWorld() {
    for (let x = -WORLD_RADIUS; x < WORLD_RADIUS; x++) {
        for (let z = -WORLD_RADIUS; z < WORLD_RADIUS; z++) {
            const height = heightAt(x, z);

            for (let y = MIN_Y; y <= height; y++) {
                let type;

                if (y === MIN_Y) {
                    type = 'stone';
                } else if (y === height) {
                    type = 'grass';
                } else if (y > height - 4) {
                    type = 'dirt';
                } else {
                    type = 'stone';
                }

                // Пещеры
                if (
                    y < height - 3 &&
                    y > MIN_Y + 1 &&
                    caveNoise(x, y, z) > 1.45
                ) {
                    continue;
                }

                // Подземные залежи
                if (
                    type === 'stone' &&
                    y < -5 &&
                    Math.random() < 0.025
                ) {
                    type = 'cobble';
                }

                addBlock(x, y, z, type);
            }
        }
    }
}

// ============================================
// 6. ДЕРЕВЬЯ
// ============================================

function createTree(x, z) {
    const ground = heightAt(x, z);

    for (let y = 1; y <= 5; y++) {
        addBlock(x, ground + y, z, 'wood');
    }

    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            for (let dy = 3; dy <= 6; dy++) {
                if (Math.abs(dx) + Math.abs(dz) <= 4) {
                    addBlock(
                        x + dx,
                        ground + dy,
                        z + dz,
                        'leaves'
                    );
                }
            }
        }
    }

    addBlock(x, ground + 7, z, 'leaves');
}

function generateTrees() {
    for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * 58) - 29;
        const z = Math.floor(Math.random() * 58) - 29;

        if (Math.abs(x) < 7 && Math.abs(z) < 7) continue;

        createTree(x, z);
    }
}

// ============================================
// 7. ДОМА И ДЕРЕВНИ
// ============================================

const beds = [];

function createHouse(x, z) {
    const ground = heightAt(x, z);

    // Пол
    for (let dx = 0; dx < 5; dx++) {
        for (let dz = 0; dz < 5; dz++) {
            addBlock(x + dx, ground + 1, z + dz, 'planks');
        }
    }

    // Стены
    for (let y = 2; y <= 4; y++) {
        for (let dx = 0; dx < 5; dx++) {
            for (let dz = 0; dz < 5; dz++) {
                const edge =
                    dx === 0 || dx === 4 ||
                    dz === 0 || dz === 4;

                if (!edge) continue;

                if (dx === 2 && dz === 0 && y <= 3) {
                    continue;
                }

                if (
                    y === 3 &&
                    ((dx === 0 || dx === 4) && dz === 2)
                ) {
                    addBlock(x + dx, ground + y, z + dz, 'glass');
                } else {
                    addBlock(x + dx, ground + y, z + dz, 'wood');
                }
            }
        }
    }

    // Крыша
    for (let dx = -1; dx <= 5; dx++) {
        for (let dz = -1; dz <= 5; dz++) {
            addBlock(x + dx, ground + 5, z + dz, 'brick');
        }
    }

    // Кровать
    const bx = x + 2;
    const bz = z + 2;

    addBlock(bx, ground + 2, bz, 'planks');
    addBlock(bx, ground + 2, bz + 1, 'bed');

    beds.push({ x: bx, y: ground, z: bz + 1 });
}

function generateVillage() {
    createHouse(12, 12);
    createHouse(-19, 14);
    createHouse(16, -19);
    createHouse(-19, -18);
}

// ============================================
// 8. МОБЫ
// ============================================

const mobs = [];

function createMob(x, z, type) {
    const group = new THREE.Group();

    const color =
        type === 'zombie' ? 0x328c46 :
        type === 'sheep' ? 0xffffff :
        0x80502b;

    const mobMaterial = new THREE.MeshLambertMaterial({
        color
    });

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        mobMaterial
    );

    head.position.y = 1.25;
    group.add(head);

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.9, 0.4),
        mobMaterial
    );

    body.position.y = 0.55;
    group.add(body);

    const legs = [];

    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.5, 0.2),
            mobMaterial
        );

        leg.position.set(
            i < 2 ? -0.2 : 0.2,
            0.1,
            i % 2 === 0 ? -0.12 : 0.12
        );

        group.add(leg);
        legs.push(leg);
    }

    group.position.set(
        x,
        heightAt(Math.round(x), Math.round(z)) + 1,
        z
    );

    scene.add(group);

    mobs.push({
        group,
        legs,
        type,
        direction: Math.random() * Math.PI * 2,
        timer: 0,
        speed: type === 'zombie' ? 1.5 : 0.8
    });
}

function generateMobs() {
    createMob(5, 5, 'sheep');
    createMob(-5, 4, 'cow');
    createMob(4, -5, 'cow');
    createMob(-8, -6, 'sheep');

    createMob(17, -10, 'zombie');
    createMob(-17, -12, 'zombie');
    createMob(20, 20, 'zombie');
}

// ============================================
// 9. ИГРОК И ФИЗИКА
// ============================================

const PLAYER_WIDTH = 0.6;
const PLAYER_HEIGHT = 1.8;

const player = {
    x: 0,
    y: heightAt(0, 0) + 0.5,
    z: 0,
    velocityY: 0,
    onGround: false,
    health: 20
};

let yaw = 0;
let pitch = 0;

camera.position.set(
    player.x,
    player.y + 1.62,
    player.z
);

const keys = {};

document.addEventListener('keydown', e => {
    keys[e.code] = true;

    if (e.code === 'Space') {
        e.preventDefault();
    }

    if (e.code.startsWith('Digit')) {
        const index = Number(e.code.slice(5)) - 1;

        if (index >= 0 && index < 6) {
            selectBlock(index);
        }
    }

    if (e.code === 'KeyE') {
        sleep();
    }
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;
});

// ============================================
// 10. СТОЛКНОВЕНИЯ И ГРАВИТАЦИЯ
// ============================================

function collides(x, y, z) {
    const minX = Math.floor(x - PLAYER_WIDTH / 2 - 0.5);
    const maxX = Math.ceil(x + PLAYER_WIDTH / 2 + 0.5);

    const minY = Math.floor(y - 0.5);
    const maxY = Math.ceil(y + PLAYER_HEIGHT + 0.5);

    const minZ = Math.floor(z - PLAYER_WIDTH / 2 - 0.5);
    const maxZ = Math.ceil(z + PLAYER_WIDTH / 2 + 0.5);

    for (let bx = minX; bx <= maxX; bx++) {
        for (let by = minY; by <= maxY; by++) {
            for (let bz = minZ; bz <= maxZ; bz++) {
                if (!blocks.has(blockKey(bx, by, bz))) continue;

                const overlapX =
                    Math.abs(x - bx) < PLAYER_WIDTH / 2 + 0.5;

                const overlapY =
                    y < by + 0.5 &&
                    y + PLAYER_HEIGHT > by - 0.5;

                const overlapZ =
                    Math.abs(z - bz) < PLAYER_WIDTH / 2 + 0.5;

                if (overlapX && overlapY && overlapZ) {
                    return by;
                }
            }
        }
    }

    return null;
}

function updatePlayer(delta) {
    const forward = new THREE.Vector3(
        -Math.sin(yaw), 0, -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
        Math.cos(yaw), 0, -Math.sin(yaw)
    );

    const movement = new THREE.Vector3();

    if (keys.KeyW) movement.add(forward);
    if (keys.KeyS) movement.sub(forward);
    if (keys.KeyD) movement.add(right);
    if (keys.KeyA) movement.sub(right);

    if (movement.length() > 0) {
        movement.normalize();

        const speed = keys.ShiftLeft ? 8 : 5;

        const nextX = player.x + movement.x * speed * delta;

        if (collides(nextX, player.y, player.z) === null) {
            player.x = nextX;
        }

        const nextZ = player.z + movement.z * speed * delta;

        if (collides(player.x, player.y, nextZ) === null) {
            player.z = nextZ;
        }
    }

    player.x = THREE.MathUtils.clamp(player.x, -31, 31);
    player.z = THREE.MathUtils.clamp(player.z, -31, 31);

    // Прыжок
    if (keys.Space && player.onGround) {
        player.velocityY = 8;
        player.onGround = false;
    }

    // Гравитация
    player.velocityY -= 22 * delta;

    const nextY = player.y + player.velocityY * delta;
    const hit = collides(player.x, nextY, player.z);

    if (hit !== null) {
        if (player.velocityY < 0) {
            player.y = hit + 0.5;
            player.onGround = true;
        } else {
            player.y = hit - 0.5 - PLAYER_HEIGHT;
        }

        player.velocityY = 0;
    } else {
        player.y = nextY;
        player.onGround = false;
    }

    // Падение в бездну
    if (player.y < MIN_Y - 5) {
        player.y = heightAt(0, 0) + 0.5;
        player.x = 0;
        player.z = 0;
        player.velocityY = 0;
        player.health -= 2;

        showMessage('Ты упал в бездну!');
    }

    camera.position.set(
        player.x,
        player.y + 1.62,
        player.z
    );
}

// ============================================
// 11. МЫШЬ И КАМЕРА
// ============================================

const instructions = document.getElementById('instructions');

document.getElementById('startButton').addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    instructions.style.display =
        document.pointerLockElement === renderer.domElement
        ? 'none'
        : 'block';
});

document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== renderer.domElement) return;

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = THREE.MathUtils.clamp(pitch, -1.5, 1.5);

    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch, yaw, 0);
});

// ============================================
// 12. ИНВЕНТАРЬ И ПАНЕЛЬ БЛОКОВ
// ============================================

const placeable = [
    'grass',
    'dirt',
    'stone',
    'wood',
    'leaves',
    'sand'
];

const icons = ['🟩', '🟫', '⬜', '🪵', '🌿', '🟨'];

let selectedBlock = 0;

const hotbar = document.getElementById('hotbar');

function createHotbar() {
    hotbar.innerHTML = '';

    icons.forEach((icon, index) => {
        const slot = document.createElement('div');

        slot.className = 'slot';
        slot.textContent = icon;

        slot.addEventListener('click', () => {
            selectBlock(index);
        });

        hotbar.appendChild(slot);
    });

    selectBlock(0);
}

function selectBlock(index) {
    selectedBlock = index;

    document.querySelectorAll('.slot').forEach((slot, i) => {
        slot.classList.toggle('selected', i === index);
    });
}

// ============================================
// 13. ДОБЫЧА И УСТАНОВКА БЛОКОВ
// ============================================

const raycaster = new THREE.Raycaster();

function getTarget() {
    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const hits = raycaster.intersectObjects(
        Object.values(instances),
        false
    );

    return hits.find(hit =>
        hit.distance < 6 &&
        hit.instanceId !== undefined
    );
}

document.addEventListener('mousedown', e => {
    if (document.pointerLockElement !== renderer.domElement) return;

    const hit = getTarget();
    if (!hit) return;

    const type = hit.object.userData.type;
    const index = hit.instanceId;

    const key = blockKeys[type][index];
    if (!key) return;

    const [x, y, z] = key.split(',').map(Number);

    // ЛКМ — ломать
    if (e.button === 0) {
        removeBlock(hit.object, index);
        return;
    }

    // ПКМ — ставить
    if (e.button === 2) {
        const normal = hit.face.normal;

        const nx = Math.round(x + normal.x);
        const ny = Math.round(y + normal.y);
        const nz = Math.round(z + normal.z);

        const distance = Math.sqrt(
            (player.x - nx) ** 2 +
            (player.y + 0.8 - ny) ** 2 +
            (player.z - nz) ** 2
        );

        if (distance < 1.3) return;

        addBlock(
            nx,
            ny,
            nz,
            placeable[selectedBlock]
        );
    }
});

document.addEventListener('contextmenu', e => {
    e.preventDefault();
});

// ============================================
// 14. КРОВАТЬ И СОН
// ============================================

let worldTime = 0;

function sleep() {
    const nearby = beds.find(b => {
        const dx = player.x - b.x;
        const dz = player.z - b.z;

        return Math.sqrt(dx * dx + dz * dz) < 3;
    });

    if (!nearby) {
        showMessage('Найди кровать!');
        return;
    }

    worldTime = 0;
    player.health = Math.min(20, player.health + 4);

    showMessage('Доброе утро! ☀️');
}

// ============================================
// 15. СМЕНА ДНЯ И НОЧИ
// ============================================

function updateDayNight(delta) {
    worldTime += delta;

    const cycle = (worldTime % 240) / 240;
    const night = cycle > 0.5;

    if (night) {
        sun.intensity = 0.3;
        scene.background.set(0x101a36);
        scene.fog.color.set(0x101a36);

        document.getElementById('time').textContent = '🌙 Ночь';
    } else {
        sun.intensity = 1.7;
        scene.background.set(0x87ceeb);
        scene.fog.color.set(0x87ceeb);

        document.getElementById('time').textContent = '☀️ День';
    }
}

// ============================================
// 16. ДВИЖЕНИЕ МОБОВ
// ============================================

function updateMobs(delta) {
    for (const mob of mobs) {
        mob.timer += delta;

        if (mob.timer > 3) {
            mob.direction += (Math.random() - 0.5) * 2;
            mob.timer = 0;
        }

        const speed = mob.speed * delta;

        mob.group.position.x +=
            Math.sin(mob.direction) * speed;

        mob.group.position.z +=
            Math.cos(mob.direction) * speed;

        const dx = player.x - mob.group.position.x;
        const dz = player.z - mob.group.position.z;

        const distance = Math.sqrt(dx * dx + dz * dz);

        if (
            mob.type === 'zombie' &&
            distance < 12 &&
            distance > 1.5
        ) {
            mob.group.position.x += dx / distance * speed;
            mob.group.position.z += dz / distance * speed;
            mob.group.rotation.y = Math.atan2(dx, dz);
        }

        mob.group.position.y =
            heightAt(
                Math.round(mob.group.position.x),
                Math.round(mob.group.position.z)
            ) + 1;

        mob.legs.forEach((leg, i) => {
            leg.rotation.x =
                Math.sin(performance.now() * 0.008 + i * Math.PI) * 0.35;
        });
    }
}

// ============================================
// 17. СООБЩЕНИЯ
// ============================================

let messageTimer;

function showMessage(text) {
    const element = document.getElementById('message');

    element.textContent = text;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        element.textContent = '';
    }, 2500);
}

// ============================================
// 18. ЗАПУСК МИРА
// ============================================

generateWorld();
generateTrees();
generateVillage();
generateMobs();
createHotbar();

showMessage('Добро пожаловать в Minecraft 3D!');

let previousTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();

    const delta = Math.min(
        (now - previousTime) / 1000,
        0.05
    );

    previousTime = now;

    updatePlayer(delta);
    updateMobs(delta);
    updateDayNight(delta);

    renderer.render(scene, camera);
}

animate();

// ============================================
// 19. ИЗМЕНЕНИЕ РАЗМЕРА ОКНА
// ============================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
