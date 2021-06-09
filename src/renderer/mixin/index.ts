import { Config } from "@/../types/config"
// import methods from "./methods";
import computed from "./computed";
import props from "./props";
import filters from "./filters";
import data from "./data";

export default {
    filters,
    props,
    data(): { config: Config } {
        return data;
    },
    computed,
    // methods,
};
