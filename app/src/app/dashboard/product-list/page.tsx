"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { Button, ConfigProvider } from "antd";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

import { Product } from "shared/src/types";

import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Popconfirm, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

export default function ProductList() {
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<Number>(1);

  const onDelete = async (sku: string) => {
    try {
      const response = await fetch(
        `${API_HOST}/api/v1/products/${sku}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Delete request failed");
      }

      console.log(`Product with SKU ${sku} deleted successfully`);

      messageApi.open({
        type: "success",
        content: "Product was deleted successfully",
      });

      await load(page);

    } catch (error) {
      console.error("Error deleting product:", error);

      Modal.error({ title: "Error deleting product" });
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 400,
    },
    {
      title: "Color",
      key: "color",
      dataIndex: "color",
      render: (color) => {
        if (color === "white") {
          return (
            <Tag
              bordered
              color={"white"}
              key={color}
              style={{ borderColor: "#999", color: "#333" }}
            >
              {color.toUpperCase()}
            </Tag>
          );
        }
        return (
          <Tag bordered color={color} key={color}>
            {color.toUpperCase()}
          </Tag>
        );
      },
      width: 100,
      align: "center",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 80,
    },
    {
      title: "Price",
      dataIndex: "price_formatted",
      key: "price",
      align: "right",
      width: 100,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a href={`/dashboard/product-detail/${record.sku}`}>Edit</a>
          <Popconfirm
            title="Confirm Delete"
            description="Are you sure to delete this product?"
            onConfirm={() => onDelete(record.sku)}
            onCancel={() => {}}
            okText="Delete"
            cancelText="Cancel"
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const load = async (page: Number) => {
    try {
        const response = await fetch(
          `${API_HOST}/api/v1/products?page=${page}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  if (loading) {
    return (
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
    );
  }

  console.log(data);

  const pagination = {
    current: data.page,
    pageSize: data.limit,
    total: data.total,
    onChange: (page: Number) => setPage(page),
  };

  return (
    <div>
      {contextHolder}
      <Table
        scroll={{ x: 800 }}
        dataSource={data ? data.products : []}
        columns={columns}
        pagination={pagination}
      />
    </div>
  );
}
