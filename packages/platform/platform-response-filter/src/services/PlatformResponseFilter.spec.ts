import {Context, EndpointMetadata, Get, PlatformContext, PlatformTest, View} from "@tsed/common";
import {catchAsyncError} from "@tsed/core";
import {Returns} from "@tsed/schema";
import {ResponseFilter} from "../decorators/responseFilter";
import {ResponseFilterMethods} from "../interfaces/ResponseFilterMethods";
import {PlatformResponseFilter} from "./PlatformResponseFilter";

@ResponseFilter("custom/json")
class CustomJsonFilter implements ResponseFilterMethods {
  transform(data: unknown, ctx: Context) {
    return {data};
  }
}

describe("PlatformResponseFilter", () => {
  beforeEach(() =>
    PlatformTest.create({
      responseFilters: [CustomJsonFilter]
    })
  );
  afterEach(() => PlatformTest.reset());

  describe("transform()", () => {
    it("should transform data for custom/json", async () => {
      class Test {
        @Get("/")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);

      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");
      const data = {text: "test"};

      jest.spyOn(ctx.response, "contentType").mockReturnThis();
      jest.spyOn(ctx.response, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "get").mockReturnValue("custom/json");
      jest.spyOn(ctx.request, "accepts").mockReturnValue(["custom/json"]);

      const result = await platformResponseFilter.transform(data, ctx);

      expect(result).toEqual({
        data: {
          text: "test"
        }
      });
    });
    it("should transform data for application/json", async () => {
      class Test {
        @Get("/")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);

      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");
      const data = {text: "test"};

      jest.spyOn(ctx.response, "contentType").mockReturnThis();
      jest.spyOn(ctx.response, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "get").mockReturnValue("application/json");
      jest.spyOn(ctx.request, "accepts").mockReturnValue(["application/json"]);

      const result = await platformResponseFilter.transform(data, ctx);

      expect(result).toEqual({
        text: "test"
      });
    });
    it("should get content-type set from response", async () => {
      class Test {
        @Get("/")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);

      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");
      const data = {text: "test"};

      jest.spyOn(ctx.response, "contentType").mockReturnThis();
      jest.spyOn(ctx.response, "get").mockReturnValue("text/json; charset: utf-8");
      jest.spyOn(ctx.request, "get").mockReturnValue("application/json");
      jest.spyOn(ctx.request, "accepts").mockReturnValue(["application/json"]);

      const result = await platformResponseFilter.transform(data, ctx);

      expect(result).toEqual({
        text: "test"
      });
    });
    it("should transform data for any content type", async () => {
      class Test {
        @Get("/")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);

      const ctx = PlatformTest.createRequestContext();
      const data = {text: "test"};
      ctx.endpoint = EndpointMetadata.get(Test, "test");

      jest.spyOn(ctx.response, "contentType").mockReturnThis();
      jest.spyOn(ctx.response, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "get").mockReturnValue("application/json");
      jest.spyOn(ctx.request, "accepts").mockReturnValue(["application/json"]);

      // @ts-ignore
      platformResponseFilter.types.set("*/*", {
        transform(data: unknown, ctx: PlatformContext) {
          return {data};
        }
      });

      const result = await platformResponseFilter.transform(data, ctx);

      expect(result).toEqual({
        data: {
          text: "test"
        }
      });
    });
    it("should transform data for default content-type from metadata", async () => {
      class Test {
        @Get("/")
        @Returns(200).ContentType("application/json")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);

      const ctx = PlatformTest.createRequestContext();
      const data = {text: "test"};
      ctx.endpoint = EndpointMetadata.get(Test, "test");

      jest.spyOn(ctx.response, "contentType").mockReturnThis();
      jest.spyOn(ctx.response, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "accepts").mockReturnValue(false);

      const result = await platformResponseFilter.transform(data, ctx);

      expect(result).toEqual({
        text: "test"
      });
    });
    it("should transform data for default content-type from metadata with any response filter", async () => {
      class Test {
        @Get("/")
        @Returns(200).ContentType("application/json")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);

      const ctx = PlatformTest.createRequestContext();
      const data = {text: "test"};
      ctx.endpoint = EndpointMetadata.get(Test, "test");

      // @ts-ignore
      platformResponseFilter.types.set("*/*", {
        transform(data: unknown, ctx: PlatformContext) {
          return {data};
        }
      });

      jest.spyOn(ctx.response, "contentType").mockReturnThis();
      jest.spyOn(ctx.response, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "get").mockReturnValue(undefined);
      jest.spyOn(ctx.request, "accepts").mockReturnValue(false);

      const result = await platformResponseFilter.transform(data, ctx);

      expect(result).toEqual({
        data: {
          text: "test"
        }
      });
    });
  });
  describe("serialize()", () => {
    it("should transform value", async () => {
      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);
      const ctx = PlatformTest.createRequestContext();

      const result = await platformResponseFilter.serialize({test: "test"}, ctx);

      expect(result).toEqual({test: "test"});
    });
    it("should transform value (endpoint)", async () => {
      class Test {
        @Get("/")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);
      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");

      jest.spyOn(ctx.endpoint, "getResponseOptions");

      const result = await platformResponseFilter.serialize({test: "test"}, ctx);

      expect(result).toEqual({test: "test"});
      expect(ctx.endpoint.getResponseOptions).toHaveBeenCalledWith(200, {includes: undefined});
    });
    it("should transform value (endpoint + includes)", async () => {
      class Test {
        @Get("/")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);
      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");

      jest.spyOn(ctx.endpoint, "getResponseOptions");

      ctx.request.query.includes = [];

      const result = await platformResponseFilter.serialize({test: "test"}, ctx);

      expect(result).toEqual({test: "test"});
      expect(ctx.endpoint.getResponseOptions).toHaveBeenCalledWith(200, {includes: []});
    });
    it("should transform value (endpoint - view)", async () => {
      class Test {
        @Get("/")
        @View("test.pug")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);
      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");
      jest.spyOn(ctx.response, "render").mockResolvedValue("template");

      const result = await platformResponseFilter.serialize({test: "test"}, ctx);

      expect(result).toEqual("template");
    });
    it("should transform value (endpoint - view - error)", async () => {
      class Test {
        @Get("/")
        @View("test.pug")
        test() {}
      }

      const platformResponseFilter = PlatformTest.get<PlatformResponseFilter>(PlatformResponseFilter);
      const ctx = PlatformTest.createRequestContext();
      ctx.endpoint = EndpointMetadata.get(Test, "test");
      jest.spyOn(ctx.response, "render").mockRejectedValue(new Error("parsing error"));

      const result = await catchAsyncError(() => platformResponseFilter.serialize({test: "test"}, ctx));

      expect(result?.message).toEqual("Template rendering error: Test.test()\nError: parsing error");
    });
  });
});
