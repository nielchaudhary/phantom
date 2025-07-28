import { Collection, Document as MongoDBDoc, MongoClient } from "mongodb";
import { Logger } from "./logger";
import { isNullOrUndefined } from "./utils";

import * as dotenv from "dotenv";

dotenv.config();

const logger = new Logger("DB");
const mongoURI = process.env.mongoURI;
export const DB_NAME = "phantomDB";
export const USERS_COLL = "users";

class DB {
  public static users: Collection<MongoDBDoc>;
  public static client: MongoClient;

  public static async init(): Promise<void> {
    if (isNullOrUndefined(mongoURI)) {
      throw new Error("mongoURI is not defined in environment variables");
    }

    try {
      logger.info(`Connecting to MongoDB...`);
      DB.client = await new MongoClient(mongoURI).connect();
      DB.users = DB.client.db(DB_NAME).collection(USERS_COLL);
      logger.info("Initialized DB connection");
    } catch (error) {
      logger.error("Failed to connect to MongoDB", error);
      throw error;
    }
  }
}

export const initDB = async (): Promise<void> => {
  if (!DB.client) {
    await DB.init();
  }
};

export const getDBColl = async <T extends MongoDBDoc = MongoDBDoc>(
  collName: string
): Promise<Collection<T>> => {
  if (!DB.client) {
    await initDB();
  }
  return DB.client.db(DB_NAME).collection(collName) as Collection<T>;
};
