"use client";

import { useParams } from "next/navigation";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

import { Product } from "shared/src/types";

import React, { useState, useEffect, useRef } from "react";
import { Space, Table, Tag, Popconfirm, Modal, message } from "antd";
import { Button, Form, Input, InputNumber } from "antd";

import styles from "./page.module.css";
import TextArea from "antd/es/input/TextArea";

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

const MAX_LEN = 55;

export default function ProductDetail() {
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter()

  const { sku } = useParams();

  const load = async () => {
    try {
      let url = `${API_HOST}/api/v1/products/${sku}`;

      const response = await fetch(url);

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
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
    );
  }

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const validateMessages = {
    required: "${label} is required!",
    types: {
      number: "${label} is not a valid number!",
    },
    number: {
      range: "${label} must be between ${min} and ${max}",
    },
    string: {
      max: "${label} must be less than ${max} characters",
    },
  };

  const currencyFormatter = (value: string | undefined) => {
    if (typeof value === "undefined") {
      return "";
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return "";
    }

    return `$ ${numericValue.toFixed(2)}`;
  };

  const currencyParser = (value: string | undefined): string => {
    if (typeof value === "undefined") {
      return "";
    }

    const numericValue = parseFloat(value.replace("$", ""));
    return isNaN(numericValue) ? "" : numericValue.toString();
  };

  const save = async (data: Product) => {
    const url = `${API_HOST}/api/v1/products/${sku}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save data");
    }

    return response.json();
  };

  const onFinish = async (values: any) => {
    console.log(values);

    try {
      await save({ ...data, ...values });

      messageApi.open({
        type: "success",
        content: "Product was saved successfully",
      });

      router.push('/dashboard/product-list');
    } catch (error) {
      console.error("Error saving product:", error);

      Modal.error({ title: "Error saving product" });
    }
  };

  return (
    <div className={styles.detail}>
      {contextHolder}
      <h1>{data.name}</h1>
      <Form
        {...layout}
        name="nest-messages"
        initialValues={data}
        onFinish={onFinish}
        style={{ padding: "50px", minWidth: "800px" }}
        validateMessages={validateMessages}
      >
        <Form.Item name={["name"]} label="Name" rules={[{ required: true, max: MAX_LEN }]}>
          <Input maxLength={MAX_LEN} />
        </Form.Item>
        <Form.Item name={["type"]} label="Type" rules={[{ required: true, max: MAX_LEN }]}>
          <Input maxLength={MAX_LEN} />
        </Form.Item>
        <Form.Item
          name={["description"]}
          label="Description"
          rules={[{ required: true, max: MAX_LEN }]}
        >
          <TextArea rows={4} maxLength={MAX_LEN} />
        </Form.Item>
        <Form.Item name={["color"]} label="Color" rules={[{ required: true, max: MAX_LEN }]}>
          <Input maxLength={MAX_LEN} />
        </Form.Item>
        <Form.Item
          name={["price"]}
          label="Price"
          rules={[{ type: "number", min: 0 }]}
        >
          <InputNumber
            formatter={currencyFormatter}
            parser={currencyParser}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
