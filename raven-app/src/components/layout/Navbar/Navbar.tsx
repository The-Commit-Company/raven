import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Image,
} from "@chakra-ui/react";
// import { ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import MyAssetBuddy from "../../../assets/images/logo.png";
import { CgProfile } from "react-icons/cg";
import { FiSettings } from "react-icons/fi";
import { MdOutlineLogout } from "react-icons/md";
import { HeadingBar } from "../HeadingBar";
import {
    HeadingBarHeader,
    HeadingBarRightElement,
} from "../HeadingBar/HeadingBar";
import { UserContext } from "../../../utils/auth/UserProvider";
import { useContext } from "react";

type Props = {};

const isActiveStyle = {
    //border cant work without px
    borderBottom: "1.5px solid gray",
    borderRadius: "0",
    paddingBottom: "4",
    color: "gray",
};
export const Navbar = (props: Props) => {

    return (
        <Box>
            <Flex
                px={8}
                h="60px"
                width="full"
                bg="white"
                shadow='md'
                alignItems={"center"}
                justifyContent={"space-between"}
            >
                <Box>
                    <Image
                        height="30px"
                        objectFit="cover"
                        src={MyAssetBuddy}
                        alt="My Asset Buddy"
                    />
                </Box>
                <Flex alignItems={"center"}>
                    <HStack as={"nav"} spacing={6}>
                        <NavLink
                            to="/dashboard"
                            style={({ isActive }) => (isActive ? isActiveStyle : {})}
                        >
                            Dashboard
                        </NavLink>
                        <MyDataMenu />
                        <NavLink
                            to="/#"
                            style={({ isActive }) => (isActive ? isActiveStyle : {})}
                        >
                            Create New Project
                        </NavLink>
                        <UserProfileMenu />
                    </HStack>
                </Flex>
            </Flex>
            <HeadingBar
                headerComponent={<HeadingBarHeader header="Dashboard" />}
                rightComponent={
                    <HeadingBarRightElement percentage={52} status="on schedule" />
                }
            />
            <Outlet />
        </Box>
    );
};

const MyDataMenu = () => {
    const location = useLocation();
    return (
        <Menu>
            <MenuButton
                py={1}
                rounded={"md"}
                style={location.pathname === "/#" ? isActiveStyle : {}}
            >
                My Data
            </MenuButton>
            <MenuList>
                <MenuItem as={NavLink} to={""}>
                    Summary
                </MenuItem>
                <MenuItem>Assets Data</MenuItem>
                <MenuItem>Materials Data</MenuItem>
                <MenuItem>Maintenance Data</MenuItem>
            </MenuList>
        </Menu>
    );
};

const UserProfileMenu = () => {

    const { logout } = useContext(UserContext)

    return (
        <Menu>
            <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
            >
                <Avatar
                    size="sm"
                    src={
                        "https://e7.pngegg.com/pngimages/498/917/png-clipart-computer-icons-desktop-chatbot-icon-blue-angle.png"
                    }
                />
            </MenuButton>
            <MenuList>
                <MenuItem icon={<CgProfile />}>Profile</MenuItem>
                <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                <MenuDivider />
                <MenuItem icon={<MdOutlineLogout />} onClick={logout}>Log Out</MenuItem>
            </MenuList>
        </Menu>
    );
};
