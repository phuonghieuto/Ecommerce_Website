const { pgp, db } = require("../configs/DBconnection");

module.exports = {
  getAll: async () => {
    const rs = await db.any('select p."productId", p."name" , p.price, p.image,  avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia from "Product" p , "Comment" c where p."productId" = c."productId" group by p."productId", p.price');
    return rs;
  },
  getByID: async (ID) => {
    const rs = db.one('select p."productId", p."name" , p.price, p.image, p."typeId" , avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia, dp.* from "Product" p LEFT join  "Comment" c on p."productId" = c."productId", "ProductDetail" dp where p."productId" = dp."productId" and p."productId" = $1 group by p."productId", p.price , dp."productId",dp."screen",dp."os",dp."cameraBehind",dp."cameraFront",dp."cpu", dp."ram", dp."rom", dp."battery", dp."sim"', [ID]);
    return rs;
  },
  add: async (data) => {
    const rs = await db.one(
      'INSERT INTO "Product"("name","quantity","typeId","image","public_id", "cost", "price") VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        data.name,
        data.quantity,
        data.typeId,
        data.image,
        data.public_id,
        data.cost,
        data.price,
      ]
    );
    return rs;
  },
  updateActiveProduct: async (id) => {
    const rs = await db.one(
      'UPDATE "Product" SET "active"=false WHERE "productId"=$1 RETURNING *',
      [id]
    );
    return rs;
  },
  update: async (data) => {
    const rs = await db.one(
      'UPDATE "Product" SET "name"=$1, "quantity"=$2, "typeId"=$3, "image"=$4, "public_id"=$5, "cost"=$6, "price"=$7  WHERE "productId"=$8 RETURNING *',
      [
        data.name,
        data.quantity,
        data.typeId,
        data.image,
        data.public_id,
        data.cost,
        data.price,
        data.productId,
      ]
    );
    return rs;
  },
  delete: async (id) => {
    const rs = await db.one(
      'DELETE FROM "Product" WHERE "productId"=$1 RETURNING *',
      [id]
    );
    return rs;
  },
  // top 5 san pham duoc danh gia cao nhat
  top5rated: async () => {
    const rs = await db.any('select p."productId", p."name" , p.price, p.image,  avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia from "Product" p LEFT join  "Comment" c on p."productId" = c."productId" group by p."productId", p.price  order by p.rate desc limit 5');
    return rs;
  },
  top5discount: async () => {
    const rs = await db.any('select p."productId", p."name", p.discount , p.price, p.image, avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia from "Product" p LEFT join  "Comment" c on p."productId" = c."productId" group by p."productId", p.price   order by p.discount desc limit 5');
    return rs;
  },
  top5modern: async () => {
    const rs = await db.any('select p."productId", p."name" , p.price, p.image,  avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia from "Product" p LEFT join  "Comment" c on p."productId" = c."productId" group by p."productId", p.price  order by p.price desc limit 5');
    return rs;
  }
  ,
  //
  top5cheapest: async () => {
    const rs = await db.any('select p."productId", p."name", p.discount , p.price,p.image, avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia  from "Product" p LEFT join  "Comment" c on p."productId" = c."productId"  group by p."productId"  order by p.price asc limit 5');
    return rs;
  },
  top5newest: async () => {
    const rs = await db.any('select p."productId", p."name", p."releaseDate" , p.price,p.image, avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia  from "Product" p LEFT join  "Comment" c on p."productId" = c."productId"  group by p."productId", p.price order by p."releaseDate" desc limit 5');
    return rs;
  },
  getproductPerpage: async (limit, offset) => {
    const rs = await db.any(`select p."productId", p."name", p."releaseDate" , p.price,p.image, avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia  from "Product" p LEFT join  "Comment" c on p."productId" = c."productId"  group by p."productId", p.price  limit ${limit} offset ${offset}`);
    return rs;
  },
  getProductByCate: async (id) => {
    const rs = await db.any(`select p."productId", p."name", p.discount , p.price,p.image, avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia  from "Product" p LEFT join  "Comment" c on p."productId" = c."productId" where "typeId" = $1  group by p."productId"  limit 10`, id);
    return rs;
  },
  selectProductByNameandCate: async (keyword) => {
    const rs = await db.any(`select p."productId", p."name", p.discount , p.price,p.image, avg((100-p.discount)*p.price)/100 as giagiam , floor(avg(c.rate)) as tb, count(*) as danhgia  from "Product" p LEFT join  "Comment" c on p."productId" = c."productId", "Type" t  where t."typeId" = p."typeId" and (p."name" ilike '%` + keyword + `%' or t."name" ilike '%` + keyword + `%' ) group by p."productId"`);
    return rs;
  }

};
