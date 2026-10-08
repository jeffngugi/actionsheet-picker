import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import {
  ActionSheetPicker,
  PickerProvider,
  useActionSheetPicker,
  type ActionSheetPickerHandle,
} from 'actionsheet-picker';
import { RHFActionSheetPicker } from 'actionsheet-picker/react-hook-form';

const countries = [{ label: 'Kenya', value: 'KE' }];
const groups = [{ label: 'Fruits', value: 1, options: [{ label: 'Apple', value: 2 }] }];

export function Screen() {
  const [one, setOne] = useState<string | null>(null);
  const [many, setMany] = useState<string[]>([]);
  const [group, setGroup] = useState<number | null>(null);
  const ref = useRef<ActionSheetPickerHandle>(null);
  const { control } = useForm<{ country: string | null; tags: string[] }>();
  const headless = useActionSheetPicker({ items: countries, value: one, onChange: setOne });

  return (
    <PickerProvider colorScheme="light" tokens={{ colors: { accent: '#2E7D32' } }}>
      <View>
        <ActionSheetPicker ref={ref} label="Country" items={countries} value={one} onChange={setOne} searchable />
        <ActionSheetPicker multiple items={countries} value={many} onChange={setMany} max={3} multipleDisplay="chips" />
        <ActionSheetPicker
          items={groups}
          hierarchy={{ type: 'nested', childrenKey: 'options' }}
          value={group}
          onChange={setGroup}
          showParentLabel
        />
        <ActionSheetPicker
          items={[{ id: 1, name: 'A' }]}
          schema={{ value: 'id', label: 'name' }}
          searchable={{ mode: 'remote', onChangeText: () => {} }}
          pagination={{ hasMore: true, loadingMore: false, onEndReached: () => {} }}
          value={null as number | null}
          onChange={() => {}}
        />
        <RHFActionSheetPicker control={control} name="country" rules={{ required: 'Required' }} items={countries} />
        <RHFActionSheetPicker control={control} name="tags" multiple items={countries} />
        {headless.isOpen ? null : null}
      </View>
    </PickerProvider>
  );
}
