import {DecoratorTypes, Metadata, prototypeOf} from "@tsed/core";
import {JsonEntityStore} from "./JsonEntityStore";
import {JsonSchema} from "./JsonSchema";
import {JsonEntityComponent} from "../decorators/config/jsonEntityComponent";
import type {JsonClassStore} from "./JsonClassStore";

@JsonEntityComponent(DecoratorTypes.PROP)
export class JsonPropertyStore extends JsonEntityStore {
  readonly parent: JsonClassStore = JsonEntityStore.from(this.target);

  /**
   * Return the required state.
   * @returns {boolean}
   */
  get required(): boolean {
    return this.parent.schema.isRequired(this.propertyKey as string);
  }

  /**
   * Change the state of the required data.
   * @param value
   */
  set required(value: boolean) {
    if (value) {
      this.parent.schema.addRequired(this.propertyKey as string);
    } else {
      this.parent.schema.removeRequired(this.propertyKey as string);
    }
  }

  get allowedRequiredValues() {
    return this.schema.$allow;
  }

  /**
   * Check precondition between value, required and allowedRequiredValues to know if the entity is required.
   * @param value
   * @returns {boolean}
   */
  isRequired(value: any): boolean {
    return this.required && [undefined, null, ""].includes(value) && !this.allowedRequiredValues.includes(value);
  }

  protected build() {
    if (!this._type) {
      this.buildType(Metadata.getType(prototypeOf(this.target), this.propertyKey));
    }

    this._type = this._type || Object;

    const properties = this.parent.schema.get("properties");

    let schema: JsonSchema = properties[this.propertyName];

    if (!schema) {
      this.parent.children.set(this.propertyName, this);

      schema = JsonSchema.from({
        type: this.collectionType || this.type
      });

      if (this.collectionType) {
        schema.itemSchema(this.type);
      }
    }

    this.parent.schema.addProperty(this.propertyName, schema);

    this._schema = schema;
  }
}
