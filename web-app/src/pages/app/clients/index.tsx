import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  EyeIcon,
  PencilIcon,
  MoreHorizontalIcon,
  LockIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageLoader from "@/components/page-loader";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessibleClients } from "@/services/client";
import { IClient, IAccessibleClientsResponse } from "@/interfaces";
import { CustomPagination } from "@/components/pagination";

function ClientsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<
    (IClient & { isAccessible: boolean })[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientPerPage, _] = useState(10);
  const [planDetails, setPlanDetails] = useState<
    IAccessibleClientsResponse["planDetails"] | null
  >(null);
  const { showError } = useToast();
  const { userId } = useParams();
  const navigate = useNavigate();

  const lastClientIndex = currentPage * clientPerPage;
  const firstClientIndex = lastClientIndex - clientPerPage;
  const currentClients = clients.slice(firstClientIndex, lastClientIndex);

  const loadClients = useCallback(
    async (_searchQuery = "") => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const response = await getAccessibleClients(userId);
        setClients(response.clients);
        setPlanDetails(response.planDetails);
        // Reset to first page when search results change
        setCurrentPage(1);
      } catch (error) {
        showError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const canAddMoreClients =
    !planDetails?.clientLimit || clients.length < planDetails.clientLimit;

  const addNewClient = () => {
    if (!canAddMoreClients) {
      showError(
        `You have reached the maximum number of clients (${planDetails?.clientLimit}) for your ${planDetails?.plan} plan. Please upgrade to add more clients.`
      );
      return;
    }
    navigate(`/${userId}/clients/new`);
  };

  const onViewClient = (client: IClient & { isAccessible: boolean }) => {
    if (!client.isAccessible) {
      navigate(`/${userId}/upgrade`);
      return;
    }
    navigate(`/${userId}/clients/${client.id}`);
  };

  const onEditClient = (client: IClient & { isAccessible: boolean }) => {
    if (!client.isAccessible) {
      navigate(`/${userId}/upgrade`);
      return;
    }
    navigate(`/${userId}/clients/${client.id}/edit`);
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadClients(searchTerm);
  };

  useEffect(() => {
    if (userId) {
      loadClients(searchTerm);
    }
  }, [userId, loadClients]);

  useEffect(() => {
    if (userId) {
      loadClients(searchTerm);
    }
  }, [searchTerm]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground">Manage your clients</p>
            {planDetails && (
              <p className="text-sm text-muted-foreground">
                {planDetails.isUnlimited ? (
                  <span className="text-green-600">
                    {clients.length} clients • Unlimited plan
                  </span>
                ) : (
                  <span
                    className={
                      canAddMoreClients ? "text-green-600" : "text-amber-600"
                    }
                  >
                    {clients.length} / {planDetails.clientLimit} clients used
                    {!canAddMoreClients && " (Limit reached)"}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <Button
          className="cursor-pointer"
          onClick={addNewClient}
          disabled={!canAddMoreClients}
        >
          Add New Client
        </Button>
      </div>

      {/* Client Limit Warning */}
      {planDetails &&
        !planDetails.isUnlimited &&
        planDetails.clientLimit &&
        planDetails.clientLimit - clients.length <= 1 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {planDetails.clientLimit <= clients.length
                      ? "Client Limit Reached"
                      : "Almost at Client Limit"}
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {planDetails.clientLimit <= clients.length
                      ? `You've reached your ${planDetails.plan} plan limit of ${planDetails.clientLimit} clients.`
                      : `You have only ${
                          planDetails.clientLimit - clients.length
                        } client slot remaining on your ${
                          planDetails.plan
                        } plan.`}{" "}
                    Upgrade to Professional for unlimited clients.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/${userId}/upgrade`)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Client List</CardTitle>
            <div className="relative w-full sm:w-64">
              <form onSubmit={onSearch}>
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No Clients Found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className={`hover:bg-muted/20 ${
                        !client.isAccessible ? "opacity-50" : ""
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {!client.isAccessible && (
                            <LockIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.pan}</TableCell>
                      <TableCell>{client.gstin}</TableCell>
                      <TableCell>{client.address}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() =>
                              !client.isAccessible
                                ? navigate(`/${userId}/upgrade`)
                                : onViewClient(client)
                            }
                            className="hidden sm:flex h-8 w-8 hover:cursor-pointer"
                            title={
                              client.isAccessible ? "View" : "Upgrade to view"
                            }
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="hidden sm:flex h-8 w-8 hover:cursor-pointer"
                            title={
                              client.isAccessible ? "Edit" : "Upgrade to edit"
                            }
                            onClick={() =>
                              !client.isAccessible
                                ? navigate(`/${userId}/upgrade`)
                                : onEditClient(client)
                            }
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>

                          {/* Mobile dropdown menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button size="icon" className="sm:hidden h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  !client.isAccessible
                                    ? navigate(`/${userId}/upgrade`)
                                    : onViewClient(client)
                                }
                                className="cursor-pointer"
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                {client.isAccessible
                                  ? "View"
                                  : "Upgrade to view"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  !client.isAccessible
                                    ? navigate(`/${userId}/upgrade`)
                                    : onEditClient(client)
                                }
                                className="cursor-pointer"
                              >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                {client.isAccessible
                                  ? "Edit"
                                  : "Upgrade to edit"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {Math.ceil(clients.length / clientPerPage) > 1 && (
        <CustomPagination
          totalItems={clients.length}
          itemsPerPage={clientPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}

export default ClientsPage;
