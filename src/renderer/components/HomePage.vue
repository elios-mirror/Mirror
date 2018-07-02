<template>
    <section class="hero is-dark is-fullheight has-text-centered">
         
        <section class="hero sidebar is-more-dark has-text-centered">
           <div class="sidebar-top">

            </div>
            <div class="sidebar-items">
                <div class="sidebar-item"
                     draggable="true"
                     v-for="community of communities"
                     :key="community.order">
                    <b-tooltip v-bind:label="community.name"
                               type="is-black"
                               position="is-right"
                               always
                               animated>
                        <div class="community"
                             v-bind:class="{'community-selected': selectedCommunity === community}"
                             @click="selectedCommunity = community">
                            <img v-bind:src="community.logo"
                                 draggable="false">
                        </div>
                    </b-tooltip>
                </div>
            </div>
        </section>
    </section>
</template>

<script lang="ts">
import Vue from "vue";
import SystemInformation from "./LandingPage/SystemInformation.vue";
import AuthService from "../../main/services/api/auth/auth.service";
import UserService from "../../main/services/api/account/user/user.service";
import UserDTO, {
  CommunityDTO
} from "../../main/services/api/account/user/user.dto";

export default Vue.extend({
  name: "landing-page",
  components: { SystemInformation },
  data() {
    return {
      selectedCommunity: null,
      communities: [] as CommunityDTO[]
    };
  },
  methods: {
    open(link: string) {
      this.$electron.shell.openExternal(link);
    },
    logout() {
      const authService = this.$container.get<AuthService>(AuthService.name);
      authService.logout();
      this.$router.push("/login");
    },
    loading() {
      this.$router.push("/loading");
    }
  },
  mounted() {
    const userService = this.$container.get<UserService>(UserService.name);
    userService.get().then((res: UserDTO) => {
      console.log(res);
      this.communities = [];
      for (let community of res.communities) {
        this.communities.push(community);
      }
    });
  }
});
</script>

<style type="scss" scoped>
.sidebar {
  position: absolute;
  height: 100%;
  width: 70px;
  padding: 0;
  margin: 0;
  animation: slide 0.5s forwards;
  left: -70px;
}

@keyframes slide {
  100% {
    left: 0;
  }
}

.sidebar-top {
  z-index: 2;
  position: relative;
  background: red;
  width: 100%;
  height: 40px;
  top: 0;
  left: 0;
}

.sidebar-items {
  overflow-x: hid;
  overflow-y: scroll;
  position: relative;
  padding: 20px 0 0 0;
  margin: 0;
}

.sidebar-item {
  position: relative;

  margin-bottom: 5px;
  transform: translate(0, 0);
}

::-webkit-scrollbar {
  display: none;
}

@keyframes shakeit {
  0% {
    border-radius: 50%;
  }
  30% {
    border-radius: 30%;
  }
  60% {
    border-radius: 35%;
  }
  90% {
    border-radius: 32%;
  }
  100% {
    border-radius: 30%;
  }
}

.community {
  overflow: hidden;
  cursor: pointer;
  background-color: black !important;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: block;
  margin: auto;
  transition: all 0.5s;
}

.community:hover {
  animation-name: shakeit;
  animation-duration: 0.4s;
  animation-timing-function: linear;
  border-radius: 30%;
}

.community.community-selected {
  border-radius: 30%;
}
</style>
