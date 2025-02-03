import React, {
	type ComponentPropsWithRef,
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	Animated,
	FlatList,
	View,
	type GestureResponderEvent,
	type KeyboardTypeOptions,
	type ListRenderItem,
	type StyleProp,
	type TextInput,
	type TextStyle,
	type ViewStyle,
} from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import type { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

type SearchListProps = ComponentPropsWithRef<typeof TextInput> & {
	icon?: IconSource;
	inputStyle?: StyleProp<TextStyle>;
	style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
	value: string;
	onChangeText?: (query: string) => void;
	onEndEditing?: (() => void) | undefined;
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
	keyboardType?: KeyboardTypeOptions | undefined;
	placeholder?: string;
	loading?: boolean;
	data: ArrayLike<any> | null | undefined;
	renderItem: ListRenderItem<any> | null | undefined;
	onClearIconPress?: (e: GestureResponderEvent) => void;
};

const SearchList = (props: SearchListProps) => {
	const theme = useTheme();
	const height = useRef(new Animated.Value(0)).current;

	const [flatlistVisible, setFlatlistVisible] = useState(false);

	useEffect(() => {
		if (props.data?.length) {
			setFlatlistVisible(true);
			Animated.timing(height, {
				toValue: 31 * props.data.length,
				duration: 300,
				useNativeDriver: false,
			}).start();
		} else {
			Animated.timing(height, {
				toValue: 0,
				duration: 300,
				useNativeDriver: false,
			}).start(() => setFlatlistVisible(false));
		}
	}, [props.data]);

	return (
		<View style={{ position: 'relative' }}>
			<Searchbar
				icon={props.icon}
				inputStyle={props.inputStyle}
				style={props.style}
				value={props.value}
				onChangeText={props.onChangeText}
				onEndEditing={props.onEndEditing}
				autoCapitalize={props.autoCapitalize}
				keyboardType={props.keyboardType}
				placeholder={props.placeholder}
				loading={props.loading}
				onClearIconPress={props.onClearIconPress}
			/>
			{flatlistVisible ? (
				<Animated.View
					style={{
						//overflow: 'hidden',
						height: height,
						minHeight: 31,
						maxHeight: 31 * 5,
						position: 'absolute',
						top: 55,
						zIndex: 10,
						elevation: 10,
						backgroundColor: theme.colors.elevation.level3,
						width: '89%',
						alignSelf: 'center',
						borderBottomRightRadius: 15,
						borderBottomLeftRadius: 15,
						borderWidth: 1,
						borderColor: theme.colors.outlineVariant,
					}}
				>
					<FlatList
						keyboardShouldPersistTaps='handled'
						scrollEnabled={true}
						data={props.data}
						renderItem={props.renderItem}
						//keyExtractor={(item) => item.item.key}
						numColumns={1}
					/>
				</Animated.View>
			) : null}
		</View>
	);
};

export default SearchList;
