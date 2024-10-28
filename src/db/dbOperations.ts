import { Categories } from "@/interfaces/Categories";
import { Cube } from "@/interfaces/Cube";
import { Solve } from "@/interfaces/Solve";
import genId from "@/lib/genId";
const IDBStore = require("idb-wrapper");

const storeName = "nx-data";
const keyPath = "id";
const dbVersion = 3;
const autoIncrement = false;
const indexes = [
  { name: "id" },
  { name: "createdAt" },
  { name: "category" },
  { name: "favorite" },
];

export async function getCubeById(id: string): Promise<Cube | null> {
  return new Promise<Cube | null>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion,
      storeName,
      keyPath,
      autoIncrement,
      onStoreReady: () => getCube(),
      indexes: indexes,
    });

    async function getCube() {
      return await cubeDB.get(
        id,
        (success: any) => {
          success === undefined ? resolve(null) : resolve(success);
        },
        (error: any) => {
          reject(error);
        }
      );
    }
  });
}

export async function getAllCubes(): Promise<Cube[]> {
  return new Promise<Cube[]>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion,
      storeName,
      keyPath,
      autoIncrement,
      onStoreReady: () => getAll(),
      indexes: indexes,
    });

    async function getAll() {
      return await cubeDB.getAll(
        (success: any) => resolve(success),
        (error: any) => reject(error)
      );
    }
  });
}

export const updateLocalCubes = async (updatedCubes: Cube[]) => {
  const cubeDB = new IDBStore({
    dbVersion,
    storeName,
    keyPath,
    autoIncrement,
    onStoreReady: async () => {
      try {
        console.log("Base de datos lista para operaciones");

        // 1. Obtener todos los cubos actuales desde IndexedDB
        const existingCubes = await getAllFromIndexedDB(cubeDB);

        // 2. Comparar y actualizar los cubos según los cambios
        await syncCubesInIndexedDB(existingCubes, updatedCubes, cubeDB);

        console.log("IndexedDB sincronizada con éxito.");
      } catch (error) {
        console.error("Error al actualizar la base de datos local:", error);
      }
    },
    onError: (error: any) => {
      console.error("Error al abrir la base de datos:", error);
    },
    indexes: indexes,
  });
};

// Función para obtener todos los cubos desde IndexedDB
const getAllFromIndexedDB = (cubeDB: any): Promise<Cube[]> => {
  return new Promise((resolve, reject) => {
    cubeDB.getAll(
      (data: Cube[]) => {
        console.log("Cubes obtenidos de IndexedDB:", data);
        resolve(data);
      },
      (error: any) => {
        console.error("Error al obtener cubos de IndexedDB:", error);
        reject(error);
      }
    );
  });
};

// Función para sincronizar los cubos en IndexedDB
const syncCubesInIndexedDB = async (
  existingCubes: Cube[],
  updatedCubes: Cube[],
  cubeDB: any
) => {
  console.log("Cubos existentes:", existingCubes);
  console.log("Cubos actualizados:", updatedCubes);

  const existingCubeMap = new Map(existingCubes.map((cube) => [cube.id, cube]));

  for (const cube of updatedCubes) {
    const existingCube = existingCubeMap.get(cube.id);

    if (existingCube) {
      // Actualizar el cubo si hay cambios
      if (JSON.stringify(existingCube) !== JSON.stringify(cube)) {
        console.log(`Actualizando cubo: ${cube.name}`);
        console.log("Antes:", existingCube);
        console.log("Después:", cube);
        await cubeDB.put(cube);
      }
      existingCubeMap.delete(cube.id); // Eliminar del mapa para saber qué cubos siguen presentes
    } else {
      // Insertar nuevo cubo
      console.log(`Insertando nuevo cubo: ${cube.name}`);
      await cubeDB.put(cube);
    }
  }

  existingCubeMap.forEach(async (cube, id) => {
    console.log(`Eliminando cubo obsoleto: ${cube.name}`);
    await cubeDB.remove(id);
  });
};

export async function saveCube({
  id = genId(),
  name,
  category,
  solves = {
    all: [],
    session: [],
  },
  createdAt = Date.now(),
  favorite = false,
}: {
  id?: string;
  name: string;
  category: Categories;
  solves?: {
    all: Solve[];
    session: Solve[];
  };
  createdAt?: number;
  favorite?: boolean;
}): Promise<Cube> {
  return new Promise<Cube>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion,
      storeName,
      keyPath,
      autoIncrement,
      onStoreReady: () => save(),
      indexes: indexes,
    });

    const newCube: Cube = {
      id,
      name: name,
      category: category,
      solves,
      createdAt,
      favorite,
    };

    async function save() {
      return await cubeDB.put(
        newCube,
        (success: any) => resolve(success),
        (error: any) => reject(error)
      );
    }
  });
}

// stores an array of solves in a single transaction

// alternative _> upsertBatch
export async function saveBatchCubes(cubesBatch: Cube[]) {
  return new Promise<void>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion,
      storeName,
      keyPath,
      autoIncrement,
      onStoreReady: () => save(),
      indexes: indexes,
    });

    async function save() {
      return await cubeDB.putBatch(
        cubesBatch,
        (success: any) => resolve(success),
        (error: any) => reject(error)
      );
    }
  });
}

export async function deleteCubeById(id: string) {
  return new Promise<void>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion,
      storeName,
      keyPath,
      autoIncrement,
      onStoreReady: () => deleteCube(),
      indexes: indexes,
    });

    async function deleteCube() {
      return await cubeDB.remove(
        id,
        (success: any) => resolve(success),
        (error: any) => reject(error)
      );
    }
  });
}

export async function clearCubes() {
  return new Promise<void>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion,
      storeName,
      keyPath,
      autoIncrement,
      onStoreReady: () => initClearCubes(),
      indexes: indexes,
    });

    async function initClearCubes() {
      return await cubeDB.clear(
        (success: any) => resolve(success),
        (error: any) => reject(error)
      );
    }
  });
}

// ### Testing area, experiment for query data from DB
// directly with indexed data, results in a better performance

// -> It can filter 68,349 objects in 1428 ms, and return sorted.

export async function test(): Promise<any> {
  // return data
  const cubeDB = await new IDBStore({
    dbVersion: 2,
    storeName: "solves",
    keyPath,
    autoIncrement,
    onStoreReady: save,
    onError: function (err: any) {
      console.log(err);
    },
    indexes: [
      { name: "id" },
      { name: "cube" },
      { name: "date" },
      { name: "number" },
    ],
  });

  async function save(): Promise<any> {
    const start = Date.now();

    const onEnd = function (item: any[]) {
      // console.table(item);
      const end = Date.now();
      console.log(`Execution time: ${end - start} ms`);
      console.log(item.length);
      return item;
    };

    const keyRange = cubeDB.makeKeyRange({
      upper: 0,
    });

    return await cubeDB.query(onEnd, {
      index: "date",
      order: "ASC",
      filterDuplicates: true,
      writeAccess: false,
      keyRange: keyRange,
    });
  }
}

export async function test2() {
  return new Promise<void>(async (resolve, reject) => {
    const cubeDB = await new IDBStore({
      dbVersion: 2,
      storeName: "solves",
      keyPath,
      autoIncrement,
      onStoreReady: () => save(),
      indexes: [
        { name: "id" },
        { name: "cube" },
        { name: "date" },
        { name: "number" },
      ],
    });

    async function save() {
      var onItem = function (item: any) {
        console.log("got item:", item);
      };
      var onEnd = function (item: any) {
        console.log("All done.");
      };

      return await cubeDB.put(
        {
          id: genId(),
          cube: "ffff",
          date: Date.now(),
          number: Math.random(),
        },
        (success: any) => resolve(success),
        (error: any) => reject(error)
      );
    }
  });
}
