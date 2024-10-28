"use client";
import { getBackupData } from "@/actions/actions";
import AccountHeader from "@/components/account/account-header/account-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllCubes, updateLocalCubes } from "@/db/dbOperations";
import { useSession } from "next-auth/react";
import { Cube } from "@/interfaces/Cube";
import Link from "next/link";

export default function Page() {
  const { data: session } = useSession();

  const loadCubes = async () => {
    try {
      const currentCubes = await getAllCubes();
      if (!currentCubes) return;

      const backupData = await getBackupData({
        email: session?.user?.email as string,
      });
      console.log(backupData);

      const backupCubes = Array.isArray(backupData)
        ? backupData.map((item) => item.data)
        : [];

      // Verificar si se procesaron cubos de respaldo
      if (backupCubes.length === 0) {
        console.warn("No se encontraron cubos de respaldo.");
      } else {
        console.log("Cubos de respaldo procesados:", backupCubes);
      }

      const updatedCubes = syncCubes(currentCubes, backupCubes);
      await updateLocalCubes(updatedCubes);
      console.log("Base de datos local actualizada exitosamente.");
    } catch (error) {
      console.error("Error al cargar los cubos:", error);
    }
  };

  const syncCubes = (cubeAll: Cube[], backupCubes: Cube[]) => {
    console.log("Cubes All:", cubeAll);
    console.log("Backup Cubes antes de la actualización:", backupCubes);

    const updatedCubes = [...backupCubes];

    // Actualizar cubos si hubo cambios de nombre o se agregaron solves nuevos
    cubeAll.forEach((cube) => {
      const backupCubeIndex = updatedCubes.findIndex(
        (bCube) => bCube.id === cube.id
      );

      if (backupCubeIndex !== -1) {
        const backupCube = updatedCubes[backupCubeIndex];

        // Actualiza el nombre
        if (backupCube.name !== cube.name) {
          console.log(
            `Actualizando nombre de ${backupCube.name} a ${cube.name}`
          );
          backupCube.name = cube.name;
        }

        // Agregar solves nuevos
        const newSolves = cube.solves.all.filter(
          (solve) =>
            !backupCube.solves.all.some((bSolve) => bSolve.id === solve.id)
        );
        if (newSolves.length > 0) {
          console.log(
            `Agregando ${newSolves.length} nuevos solves a ${backupCube.name}`
          );
          backupCube.solves.all.push(...newSolves);
        }
      } else {
        // Si el cubo no existe en el respaldo, se agrega
        console.log(`Agregando nuevo cubo: ${cube.name}`);
        updatedCubes.push(cube);
      }
    });

    // Eliminar cubos que ya no existen
    for (let i = updatedCubes.length - 1; i >= 0; i--) {
      if (!cubeAll.find((cube) => cube.id === updatedCubes[i].id)) {
        console.log(
          `Eliminando cubo que ya no existe: ${updatedCubes[i].name}`
        );
        updatedCubes.splice(i, 1);
      }
    }

    console.log("Cubes actualizados después de la eliminación:", updatedCubes);
    console.log("Resultado final de updatedCubes:", updatedCubes);

    return updatedCubes;
  };

  return (
    <>
      <AccountHeader back="./" label="Load data" />

      <Card className="p-3 bg-secondary/10">
        <p>
          Do you want to <span className="text-green-700">download</span> your
          account data from the <span className="text-blue-700">cloud</span>?
        </p>
        <p className="text-yellow-600">
          This will merge current data with saved data.
        </p>

        <div className="flex gap-2 w-full justify-between mt-5">
          <Link href={"./"}>
            <Button>Back</Button>
          </Link>

          <Button
            onClick={async () => {
              await loadCubes();
            }}
          >
            Continue
          </Button>
        </div>
      </Card>
    </>
  );
}
