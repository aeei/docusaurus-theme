/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import { translate } from "@docusaurus/Translate";
import { X } from "lucide-react";
import { ErrorMessage } from "@hookform/error-message";
import { nanoid } from "@reduxjs/toolkit";
import FormLabel from "@theme/ApiExplorer/FormLabel";
import FormSelect from "@theme/ApiExplorer/FormSelect";
import FormTextInput from "@theme/ApiExplorer/FormTextInput";
import { Param, setParam } from "@theme/ApiExplorer/ParamOptions/slice";
import { useTypedDispatch } from "@theme/ApiItem/hooks";
import { Controller, useFormContext } from "react-hook-form";

export interface ParamProps {
  param: Param;
  label?: string;
  type?: string;
  required?: boolean;
}

function ArrayItem({
  param,
  onChange,
  initialValue,
}: ParamProps & { onChange(value?: string): any; initialValue?: string }) {
  const [value, setValue] = useState(initialValue || "");

  if (param.schema?.items?.type === "boolean") {
    return (
      <FormSelect
        ariaLabel={param.description || param.name}
        options={["---", "true", "false"]}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const val = e.target.value;
          onChange(val === "---" ? undefined : val);
        }}
      />
    );
  }

  return (
    <FormTextInput
      placeholder={param.description || param.name}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}

export default function ParamArrayFormItem({
  param,
  label,
  type,
  required,
}: ParamProps) {
  const [items, setItems] = useState<{ id: string; value?: string }[]>([]);
  const dispatch = useTypedDispatch();

  const {
    control,
    formState: { errors },
  } = useFormContext();

  const showErrorMessage = errors?.paramArray?.message;

  function handleAddItem(e: any) {
    e.preventDefault(); // prevent form from submitting
    setItems((i) => [
      ...i,
      {
        id: nanoid(),
      },
    ]);
  }

  useEffect(() => {
    const values = items
      .map((item) => item.value)
      .filter((item): item is string => !!item);

    dispatch(
      setParam({
        ...param,
        value: values.length > 0 ? values : undefined,
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const example = param.schema?.example;
    if (Array.isArray(example) && example.length > 0) {
      const examplesWithIds = example.map((item: any) => ({
        id: nanoid(),
        value: item.toString(),
      }));

      setItems(examplesWithIds);
    }
  }, [param.schema?.example]);

  function handleDeleteItem(itemToDelete: { id: string }) {
    return () => {
      const newItems = items.filter((i) => i.id !== itemToDelete.id);
      setItems(newItems);
    };
  }

  function handleChangeItem(itemToUpdate: { id: string }, onChange: any) {
    return (value: string) => {
      const newItems = items.map((i) => {
        if (i.id === itemToUpdate.id) {
          return { ...i, value: value };
        }
        return i;
      });
      setItems(newItems);
      onChange(newItems);
    };
  }

  return (
    <>
      {label && <FormLabel label={label} type={type} required={required} />}
      <Controller
        control={control}
        rules={{
          required: param.required
            ? translate({
                id: "theme.openapi.form.fieldRequired",
                message: "This field is required",
              })
            : false,
        }}
        name="paramArray"
        render={({ field: { onChange } }) => (
          <>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex" }}>
                <ArrayItem
                  param={param}
                  onChange={handleChangeItem(item, onChange)}
                  initialValue={item.value}
                />
                <button
                  type="button"
                  className="openapi-explorer__delete-btn"
                  onClick={handleDeleteItem(item)}
                  aria-label="Delete"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </div>
            ))}
            <button
              className="openapi-explorer__thin-btn"
              onClick={handleAddItem}
            >
              {translate({
                id: "theme.openapi.paramArray.addItem",
                message: "Add item",
              })}
            </button>
          </>
        )}
      />
      {showErrorMessage && (
        <ErrorMessage
          errors={errors}
          name="paramArray"
          render={({ message }) => (
            <div className="openapi-explorer__input-error">{message}</div>
          )}
        />
      )}
    </>
  );
}
