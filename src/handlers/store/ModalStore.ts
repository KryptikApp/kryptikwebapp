import {
  IClientMeta,
  IWalletConnectSession,
} from "@walletconnect/legacy-types";
import {
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types/dist/types/sign-client";
import { proxy } from "valtio";
import { IParsedWcRequest } from "../connect/types";

// model data types
interface ModalData {
  proposal?: SignClientTypes.EventArguments["session_proposal"];
  isLegacy?: boolean;
  parsedRequest?: IParsedWcRequest;
  requestEvent?: SignClientTypes.EventArguments["session_request"];
  requestSession?: SessionTypes.Struct;
  legacyProposal?: {
    id: number;
    params: [{ chainId: number; peerId: string; peerMeta: IClientMeta }];
  };
  legacyCallRequestEvent?: { id: number; method: string; params: any[] };
  legacyRequestSession?: IWalletConnectSession;
}

interface State {
  open: boolean;
  view?:
    | "SessionProposalModal"
    | "SessionSignModal"
    | "SessionSignTypedDataModal"
    | "SessionSendTransactionModal"
    | "SessionUnsuportedMethodModal"
    | "SwitchNetworkModal";
  data?: ModalData;
}

// state
const state = proxy<State>({
  open: false,
});

// store and actions
const ModalStore = {
  state,

  open(view: State["view"], data: State["data"]) {
    console.log("AQUIIII");
    state.view = view;
    state.data = data;
    state.open = true;
  },

  close() {
    state.open = false;
  },
};

export default ModalStore;
