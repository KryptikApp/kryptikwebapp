import { ServiceState } from "./types";

interface Service {
  serviceState: ServiceState;
  //TODO: add requirement for start service func.s
}

class BaseService implements Service {
  serviceState: ServiceState;
  serviceId: string;
  constructor() {
    this.serviceState = ServiceState.unstarted;
    this.serviceId = Math.random().toString();
  }
  // should be implemented by service classes that extend this base service class
  protected async InternalStartService() {
    return this;
  }

  // start service should NOT be overriden by derived class. Modify internalstartservice() instead
  async StartSevice(): Promise<this> {
    console.log("Starting Service");
    console.log("Service state:");
    console.log(this.serviceState);
    switch (this.serviceState) {
      case ServiceState.started:
        return this;

      case ServiceState.stopped:
        throw new Error("Service is already stopped and cannot be restarted.");

      case ServiceState.unstarted:
        try {
          this.serviceState = ServiceState.started;
          return this.InternalStartService();
        } catch {
          throw new Error("Error running internal start service routines.");
        }

      default: {
        const exhaustiveCheck: never = this.serviceState;
        throw new Error(`Unreachable code: ${exhaustiveCheck}`);
      }
    }
  }
}

export default BaseService;
