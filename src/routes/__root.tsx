import Navbar from "@/components/navbar";
import { GlobalContextProvider } from "@/context/GlobalContext";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <GlobalContextProvider>
        <Navbar />
        <Outlet />
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </GlobalContextProvider>
    </>
  ),
});
