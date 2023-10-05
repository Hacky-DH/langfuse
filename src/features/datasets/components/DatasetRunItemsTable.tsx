import { GroupedScoreBadges } from "@/src/components/grouped-score-badge";
import { DataTable } from "@/src/components/table/data-table";
import TableLink from "@/src/components/table/table-link";
import { api } from "@/src/utils/api";
import { type RouterOutput } from "@/src/utils/types";
import { type ColumnDef } from "@tanstack/react-table";

type RowData = {
  id: string;
  runAt: string;
  datasetItemId: string;
  observation: { id: string; traceId: string };
  scores: { name: string; value: number }[];
};

export function DatasetRunItemsTable(
  props:
    | {
        projectId: string;
        datasetId: string;
        datasetRunId: string;
      }
    | {
        projectId: string;
        datasetId: string;
        datasetItemId: string;
      },
) {
  const runItems = api.datasets.runitemsByRunIdOrItemId.useQuery(props);

  const columns: ColumnDef<RowData>[] = [
    {
      accessorKey: "runAt",
      header: "Run At",
    },
    {
      accessorKey: "datasetItemId",
      header: "Dataset Item",
      cell: ({ row }) => {
        const datasetItemId: string = row.getValue("datasetItemId");
        return (
          <TableLink
            path={`/project/${props.projectId}/datasets/${props.datasetId}/items/${datasetItemId}`}
            value={datasetItemId}
            truncateAt={7}
          />
        );
      },
    },
    {
      accessorKey: "observation",
      header: "Observation",
      cell: ({ row }) => {
        const observation: RowData["observation"] = row.getValue("observation");
        return (
          <TableLink
            path={`/project/${props.projectId}/traces/${observation.traceId}?observation=${observation.id}`}
            value={observation.id}
            truncateAt={7}
          />
        );
      },
    },
    {
      accessorKey: "scores",
      header: "Scores",
      cell: ({ row }) => {
        const scores: RowData["scores"] = row.getValue("scores");
        return <GroupedScoreBadges scores={scores} variant="headings" />;
      },
    },
  ];

  const convertToTableRow = (
    item: RouterOutput["datasets"]["runitemsByRunIdOrItemId"][number],
  ): RowData => {
    return {
      id: item.id,
      runAt: item.createdAt.toISOString(),
      datasetItemId: item.datasetItemId,
      observation: {
        id: item.observation.id,
        traceId: item.observation.traceId ?? "", // never actually null, just not enforced by db
      },
      scores: item.observation.scores.map((score) => ({
        name: score.name,
        value: score.value,
      })),
    };
  };

  return (
    <DataTable
      columns={columns}
      data={
        runItems.isLoading
          ? { isLoading: true, isError: false }
          : runItems.isError
          ? {
              isLoading: false,
              isError: true,
              error: runItems.error.message,
            }
          : {
              isLoading: false,
              isError: false,
              data: runItems.data?.map((t) => convertToTableRow(t)),
            }
      }
    />
  );
}